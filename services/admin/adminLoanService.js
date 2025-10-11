import { db } from "../firebaseConfig";
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    addDoc,
    serverTimestamp,
} from "firebase/firestore";

// Fetch all loans with borrower and KYC details
export const fetchAllLoans = async () => {
    try {
        const loanSnapshot = await getDocs(collection(db, "Loans"));
        const loansData = loanSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

        const userSnapshot = await getDocs(collection(db, "users"));
        const usersData = userSnapshot.docs.map((doc) => ({ ...doc.data(), userId: doc.id }));
        const usersMap = {};
        usersData.forEach((u) => { usersMap[u.userId] = u; });

        const kycSnapshot = await getDocs(collection(db, "kycSubmissions"));
        const kycData = kycSnapshot.docs.map((doc) => doc.data());
        const kycMap = {};
        kycData.forEach((k) => {
            if (k.userId) kycMap[k.userId] = k;
        });

        // Merge data
        return loansData.map((loan) => {
            const borrower = usersMap[loan.borrowerId] || {};
            const kyc = kycMap[loan.borrowerId] || {};
            return {
                ...loan,
                borrowerName: borrower.name || "Unknown",
                borrowerEmail: borrower.email || "",
                borrowerPhone: kyc.phone || "",
                monthlyIncome: kyc.monthlyIncome || 0,
                kycStatus: kyc.kycStatus || "pending",
            };
        });
    } catch (error) {
        console.error("Error fetching loans:", error);
        throw error;
    }
};

// Update loan status & send notification
export const updateLoanStatus = async (updatedLoan) => {
    try {
        const loanRef = doc(db, "Loans", updatedLoan.id);
        await updateDoc(loanRef, { status: updatedLoan.status });

        // Notification message setup
        const getNotification = () => {
            switch (updatedLoan.status) {
                case "approved":
                    return {
                        title: "Loan Approved",
                        message: `Your loan request #${updatedLoan.id} has been approved and is now available for funding.`,
                    };
                case "funding":
                    return {
                        title: "Loan Approved",
                        message: `Your loan request #${updatedLoan.id} has been approved for funding.`,
                    };
                case "rejected":
                    return {
                        title: "Loan Rejected",
                        message: `Your loan request #${updatedLoan.id} was rejected.`,
                    };
                case "disbursed":
                    return {
                        title: "Funds Disbursed",
                        message: `Funds for your loan #${updatedLoan.id} have been disbursed.`,
                    };
                default:
                    return {
                        title: "Loan Update",
                        message: `Your loan #${updatedLoan.id} status changed to ${updatedLoan.status}.`,
                    };
            }
        };

        const notification = getNotification();
        await addDoc(collection(db, "notifications"), {
            userId: updatedLoan.borrowerId,
            title: notification.title,
            message: notification.message,
            createdAt: serverTimestamp(),
            isRead: false,
        });

        return { success: true, message: `Loan #${updatedLoan.id} updated to ${updatedLoan.status}` };
    } catch (error) {
        console.error("Error updating loan:", error);
        return { success: false, message: "Error: Could not update loan status" };
    }
};
