import { db } from "../firebaseConfig";
import { collection, getDocs, getDoc, doc, updateDoc, addDoc, serverTimestamp, setDoc } from "firebase/firestore";

// Create new escrow entry
export const createEscrow = async ({ loanId, lenderId, borrowerId, amount }) => {
    try {
        const escrowRef = doc(collection(db, "escrow"));
        const escrowData = {
            escrowId: escrowRef.id,
            loanId,
            lenderId,
            borrowerId,
            amount,
            status: "pending",
            createdAt: serverTimestamp()
        };
        
        await setDoc(escrowRef, escrowData);
        return { escrowId: escrowRef.id, ...escrowData };
    } catch (error) {
        console.error("Error creating escrow:", error);
        throw error;
    }
};

// Fetch all escrows with borrower, lender, and loan info
export const fetchEscrows = async () => {
    try {
        const escrowSnapshot = await getDocs(collection(db, "escrow"));
        const escrowData = [];

        for (const escrowDoc of escrowSnapshot.docs) {
            const escrow = escrowDoc.data();
            escrow.escrowId = escrowDoc.id;

            // Fetch borrower and lender info
            const borrowerSnap = await getDoc(doc(db, "users", escrow.borrowerId));
            const lenderSnap = await getDoc(doc(db, "users", escrow.lenderId));
            const borrowerName = borrowerSnap.exists() ? borrowerSnap.data().name : "Unknown";
            const lenderName = lenderSnap.exists() ? lenderSnap.data().name : "Unknown";

            // Fetch loan info
            const loanSnap = await getDoc(doc(db, "Loans", escrow.loanId));
            const loan = loanSnap.exists() ? loanSnap.data() : {};
            const amount = loan.amountRequested || escrow.amount;
            const purpose = loan.purpose || "";
            const requestDate = loan.createdAt ? new Date(loan.createdAt.seconds * 1000).toLocaleDateString() : "";

            escrowData.push({
                id: escrow.escrowId,
                borrowerId: escrow.borrowerId,
                lenderId: escrow.lenderId,
                borrower: borrowerName,
                lender: lenderName,
                amount,
                purpose,
                requestDate,
                status: escrow.status
            });
        }

        return escrowData;
    } catch (error) {
        console.error("Error fetching escrows:", error);
        throw error;
    }
};

//  Update escrow status and send notification
export const updateEscrowStatus = async (escrowId, newStatus, lenderId, amount) => {
    try {
        // Update escrow status
        await updateDoc(doc(db, "escrow", escrowId), { status: newStatus });

        // Update lender wallet if refunded
        if (newStatus === "refunded") {
            const lenderWalletRef = doc(db, "wallets", lenderId);
            const lenderWalletSnap = await getDoc(lenderWalletRef);
            if (lenderWalletSnap.exists()) {
                const currentBalance = lenderWalletSnap.data().balance || 0;
                await updateDoc(lenderWalletRef, { balance: currentBalance + amount });
            }
        }

        // Add notification
        await addDoc(collection(db, "notifications"), {
            userId: lenderId,
            message: `Your escrow for Loan #${escrowId} has been ${newStatus}`,
            type: newStatus === "released" ? "fundReleased" : "fundRefunded",
            isRead: false,
            timestamp: serverTimestamp()
        });

        return { success: true, message: `Escrow ${newStatus} successfully!` };
    } catch (error) {
        console.error("Error updating escrow:", error);
        return { success: false, message: "Failed to update escrow" };
    }
};
