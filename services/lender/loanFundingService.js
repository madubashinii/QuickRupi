import { db } from "../firebaseConfig";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { withdrawFunds } from "../wallet/walletService";
import { createEscrow } from "../admin/escrowService";
import { createTransaction, TRANSACTION_TYPES, TRANSACTION_STATUS } from "../transactions";
import { createRepaymentSchedule } from "../repayment/repaymentService";

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

