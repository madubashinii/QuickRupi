import { db } from "../firebaseConfig";
import { collection, onSnapshot, getDocs, query, where, doc, updateDoc, addDoc } from "firebase/firestore";

// Fetch all KYC submissions and map with loan info
export const fetchKYCRequests = (onUpdate) => {
    return onSnapshot(collection(db, "kycSubmissions"), async (snapshot) => {
        const data = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data(),
        }));

        const approvedCount = data.filter(u => u.kycStatus === "approved").length;

        const mappedData = await Promise.all(data.map(async (user) => {
            let loanRequest = null;
            try {
                if (user.userId) {
                    const loansQuery = query(
                        collection(db, "loans"),
                        where("borrowerId", "==", user.userId)
                    );
                    const loanSnapshot = await getDocs(loansQuery);

                    if (!loanSnapshot.empty) {
                        const latestLoan = loanSnapshot.docs
                            .map(doc => doc.data())
                            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))[0];
                        loanRequest = latestLoan.amountRequested || null;
                    }
                }
            } catch (err) {
                console.error("Error fetching loan info:", err);
            }

            return {
                id: user.id,
                userId: user.userId || null,
                name: user.fullName || "Unknown",
                email: user.email || "No email",
                applied: user.submittedAt ? new Date(user.submittedAt.seconds * 1000).toLocaleDateString() : "N/A",
                accountType: user.accountType || (user.isBusiness ? "Business Borrower" : "Personal Borrower"),
                loanRequest,
                riskScore: user.riskScore || "Medium",
                priority: user.priority || "normal",
                documents: user.documents || ["NIC", "Income", "Address", "Selfie"],
                kycStatus: user.kycStatus || "pending",
            };
        }));

        // Return only non-approved requests
        onUpdate(mappedData.filter(u => u.kycStatus !== "approved"), approvedCount);
    }, (error) => {
        console.error("Firestore listener error:", error);
        onUpdate([], 0);
    });
};

// Approve or reject KYC and create notification
export const updateKYCStatus = async (user, action) => {
    if (!user) return;

    try {
        const kycRef = doc(db, "kycSubmissions", user.id);
        await updateDoc(kycRef, {
            kycStatus: action === "approve" ? "approved" : "rejected",
        });

        if (user.userId) {
            await addDoc(collection(db, "notifications"), {
                userId: user.userId,
                message:
                    action === "approve"
                        ? "Your KYC has been approved! You can now apply for or fund loans."
                        : "Your KYC submission was rejected. Please review and resubmit your details.",
                type: action === "approve" ? "kycApproved" : "kycRejected",
                isRead: false,
                timestamp: new Date(),
            });
        } else {
            console.warn(`⚠️ Missing userId for KYC ${user.id}`);
        }

        return { success: true, message: `KYC ${action === "approve" ? "approved" : "rejected"} for ${user.name}` };
    } catch (err) {
        console.error("Error updating KYC:", err);
        return { success: false, message: "Failed to update KYC" };
    }
};
