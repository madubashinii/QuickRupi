import { db } from "../firebaseConfig";
import { collection, getDocs, getDoc, doc, updateDoc, addDoc, serverTimestamp, query, where } from "firebase/firestore";

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
            const loanSnap = await getDoc(doc(db, "loans", escrow.loanId));
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
/**
 * Update escrow status and handle wallet & repayment schedule, send notification
 */
export const updateEscrowStatus = async (escrowId, newStatus, lenderId, amount) => {
    try {
        // Get escrow
        const escrowRef = doc(db, "escrow", escrowId);
        const escrowSnap = await getDoc(escrowRef);
        if (!escrowSnap.exists()) throw new Error("Escrow not found");
        const escrow = escrowSnap.data();

        // Update escrow status
        await updateDoc(escrowRef, { status: newStatus, releasedAt: serverTimestamp() });

        // Handle borrower wallet if escrow released
        if (newStatus === "released") {
            // Query borrower wallet by userId
            const walletQuery = query(collection(db, "borrowerWallets"), where("userId", "==", escrow.borrowerId));
            const walletSnap = await getDocs(walletQuery);

            if (!walletSnap.empty) {
                const walletDoc = walletSnap.docs[0];
                const currentBalance = walletDoc.data().balance || 0;

                await updateDoc(walletDoc.ref, {
                    balance: currentBalance + amount,
                    lastUpdated: serverTimestamp()
                });
            } else {
                console.warn("Borrower wallet not found for userId:", escrow.borrowerId);
            }

            // Create repayment schedule
            const loanRef = doc(db, "loans", escrow.loanId);
            const loanSnap = await getDoc(loanRef);
            if (loanSnap.exists()) {
                const loan = loanSnap.data();
                const principal = loan.amountFunded || amount;
                const monthlyRate = (loan.interestRate || 0) / 12 / 100;
                const months = loan.termMonths || 1;

                const repayments = [];
                for (let i = 1; i <= months; i++) {
                    const interestAmount = principal * monthlyRate;
                    const totalAmount = principal / months + interestAmount;
                    const dueDate = new Date();
                    dueDate.setMonth(dueDate.getMonth() + i);

                    repayments.push({
                        loanId: loan.loanId,
                        borrowerId: loan.borrowerId,
                        lenderId: escrow.lenderId,
                        dueDate: dueDate.toISOString(),
                        totalAmount,
                        principleAmount: principal / months,
                        interestAmount,
                        status: "pending",
                        createdAt: serverTimestamp()
                    });
                }

                // Save repayments
                const batchPromises = repayments.map(rep => addDoc(collection(db, "repayments"), rep));
                await Promise.all(batchPromises);
            }
        }

        // Handle lender wallet if escrow refunded
        if (newStatus === "refunded") {
            const walletQuery = query(collection(db, "wallets"), where("userId", "==", lenderId));
            const walletSnap = await getDocs(walletQuery);

            if (!walletSnap.empty) {
                const walletDoc = walletSnap.docs[0];
                const currentBalance = walletDoc.data().balance || 0;

                await updateDoc(walletDoc.ref, {
                    balance: currentBalance + amount,
                    lastUpdated: serverTimestamp()
                });
            } else {
                console.warn("Lender wallet not found for userId:", lenderId);
            }
        }

        // Send notification to lender
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
