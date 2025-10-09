import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Prepare initials from name
 */
const getInitials = (name) => {
    if (!name) return "U";
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
};

/**
 * Convert Firestore timestamp to readable string
 */
const formatTimestamp = (ts) => {
    if (!ts) return "N/A";
    if (ts instanceof Timestamp) {
        return ts.toDate().toLocaleDateString();
    }
    return ts;
};

/**
 * Fetch all users and KYC submissions
 * Returns fully prepared objects ready for display
 */
export const fetchUsersWithKYC = async () => {
    try {
        const usersSnap = await getDocs(collection(db, "users"));
        const kycSnap = await getDocs(collection(db, "kycSubmissions"));

        const usersList = usersSnap.docs.map((doc) => doc.data());
        const kycList = kycSnap.docs.map((doc) => doc.data());

        const enhancedUsers = usersList.map((u) => {
            let status;
            let kyc = kycList.find((k) => k.userId === u.userId) || null;

            if (u.role === "lender") {
                status = "verified";
            } else {
                if (!kyc) status = "new";
                else if (kyc.kycStatus === "pending") status = "pending";
                else if (kyc.kycStatus === "approved") status = "verified";
                else if (kyc.kycStatus === "rejected") status = "rejected";
                else status = "new";
            }

            return {
                ...u,
                status,
                initials: getInitials(u.name),
                kyc: u.role === "borrower" ? kyc : null,
            };
        });

        return enhancedUsers;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};
