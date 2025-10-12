import { db } from "../firebaseConfig";
import { doc, updateDoc, serverTimestamp, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { withdrawFunds } from "../wallet/walletService";
import { createEscrow } from "../admin/escrowService";
import { createTransaction, TRANSACTION_TYPES, TRANSACTION_STATUS } from "../transactions";
import { createRepaymentSchedule } from "../repayment/repaymentService";
import { createNotification, NOTIFICATION_TYPES, NOTIFICATION_PRIORITY } from "../notifications/notificationService";

/**
 * Get all admin user IDs from Firestore
 * @returns {Promise<string[]>} Array of admin user IDs
 */
const getAdminUserIds = async () => {
  try {
    const usersSnapshot = await getDocs(
      query(collection(db, "users"), where("role", "==", "admin"))
    );
    return usersSnapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return [];
  }
};

/**
 * Fund a loan - orchestrates wallet deduction, escrow creation, and loan status update
 * @param {string} loanId - Loan ID
 * @param {string} lenderId - Lender user ID
 * @param {string} borrowerId - Borrower user ID  
 * @param {number} amount - Amount to fund
 * @returns {Promise<Object>} Result with success status and data
 */
export const fundLoan = async ({ loanId, lenderId, borrowerId, amount }) => {
    try {
        // Step 1: Deduct from lender's wallet
        const newBalance = await withdrawFunds(
            lenderId, 
            amount, 
            null, 
            `Funding loan #${loanId}`
        );
        
        // Step 2: Create escrow entry
        const escrow = await createEscrow({
            loanId,
            lenderId,
            borrowerId,
            amount
        });

        // Notify all admins about escrow pending approval
        try {
            const adminIds = await getAdminUserIds();
            for (const adminId of adminIds) {
                await createNotification({
                    userId: adminId,
                    type: NOTIFICATION_TYPES.ESCROW_PENDING_APPROVAL,
                    title: 'Escrow Pending Approval',
                    body: `Lender ${lenderId} funded loan #${loanId} with LKR ${amount.toLocaleString()}`,
                    priority: NOTIFICATION_PRIORITY.HIGH,
                    loanId,
                    amount,
                    metadata: { relatedUserId: lenderId }
                });
            }
        } catch (error) {
            console.error('Failed to send admin notifications:', error);
            // Don't throw - main operations succeeded
        }
        
        // Step 3: Get loan details for repayment schedule
        const loanRef = doc(db, "Loans", loanId);
        const loanDoc = await getDoc(loanRef);
        if (!loanDoc.exists()) {
            throw new Error("Loan not found");
        }
        const loanData = loanDoc.data();

        // Step 4: Create repayment schedule
        if (!loanData.termMonths || !(loanData.interestRate || loanData.apr)) {
            throw new Error("Missing loan terms (months or interest rate)");
        }

        const repaymentId = await createRepaymentSchedule({
            loanId,
            loanAmount: amount,
            annualInterestRate: loanData.interestRate || loanData.apr,
            termMonths: loanData.termMonths,
            startDate: new Date().toISOString(),
            borrowerId,
            lenderId
        });

        // Step 5: Update loan status to "funding" and link lender
        await updateDoc(loanRef, {
            status: "funding",
            lenderId: lenderId,
            fundedAmount: amount,
            fundedAt: serverTimestamp(),
            escrowId: escrow.escrowId,
            repaymentId: repaymentId
        });
        
        // Step 4: Create investment transaction record
        try {
            await createTransaction({
                userId: lenderId,
                amount,
                type: TRANSACTION_TYPES.INVESTMENT,
                loanId,
                status: TRANSACTION_STATUS.COMPLETED,
                description: `Investment in loan #${loanId} - In escrow pending approval`
            });
        } catch (error) {
            console.error('Failed to create transaction record:', error);
            // Don't throw - main operations succeeded
        }

        // Step 5: Send notification to lender
        try {
            await createNotification({
                userId: lenderId,
                type: NOTIFICATION_TYPES.FUNDING_CONFIRMED,
                title: 'Funding Confirmed',
                body: `Your investment of LKR ${amount.toLocaleString()} in loan #${loanId} is pending admin approval`,
                priority: NOTIFICATION_PRIORITY.HIGH,
                loanId,
                amount
            });
        } catch (error) {
            console.error('Failed to create notification:', error);
            // Don't throw - main operations succeeded
        }
        
        return {
            success: true,
            message: 'Loan funded successfully! Awaiting admin approval.',
            data: {
                loanId,
                escrowId: escrow.escrowId,
                newWalletBalance: newBalance,
                fundedAmount: amount
            }
        };
        
    } catch (error) {
        console.error("Error funding loan:", error);
        throw new Error(error.message || 'Failed to fund loan');
    }
};

