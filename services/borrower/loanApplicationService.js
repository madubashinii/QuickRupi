import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { createNotification, NOTIFICATION_TYPES, NOTIFICATION_PRIORITY } from "../notifications/notificationService";

// Create new loan application
export const createLoanApplication = async (loanData) => {
    try {
        const loanDoc = await addDoc(collection(db, "Loans"), {
            ...loanData,
            status: "pending",
            createdAt: serverTimestamp()
        });

        await createNotification({
            userId: 'ADMIN001',
            type: NOTIFICATION_TYPES.NEW_LOAN_APPLICATION,
            title: 'New Loan Application',
            body: `${loanData.borrowerName} applied for LKR ${loanData.amountRequested.toLocaleString()} - ${loanData.purpose}`,
            priority: NOTIFICATION_PRIORITY.HIGH,
            loanId: loanDoc.id,
            amount: loanData.amountRequested
        });

        return { success: true, loanId: loanDoc.id };
    } catch (error) {
        console.error("Error creating loan application:", error);
        return { success: false, error: error.message };
    }
};

