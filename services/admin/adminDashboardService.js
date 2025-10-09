import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";

// Helper for currency formatting
const formatLKR = (val) => {
    if (!val || isNaN(val)) return "0.00";
    return Number(val).toLocaleString("en-LK", { minimumFractionDigits: 2 });
};

export const fetchDashboardData = async () => {
    try {
        // Fetch collections
        const [escrowSnap, loansSnap, repaymentsSnap, usersSnap] = await Promise.all([
            getDocs(collection(db, "escrow")),
            getDocs(collection(db, "loans")),
            getDocs(collection(db, "repayments")),
            getDocs(collection(db, "users")),
        ]);

        // Compute totals
        const escrowTotal = escrowSnap.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
        const activeLoans = loansSnap.docs.filter(doc => doc.data().status === "repaying").length;
        const overdueLoans = repaymentsSnap.docs.filter(doc => {
            const r = doc.data();
            return r.status === "pending" && new Date(r.dueDate) < new Date();
        }).length;
        const totalLoans = loansSnap.docs.length;
        const successRate = totalLoans
            ? Math.round(((totalLoans - overdueLoans) / totalLoans) * 100)
            : 0;

        // Create live recent activity
        const activityList = [];

        // Add recent loan requests
        loansSnap.docs.slice(0, 2).forEach(doc => {
            const loan = doc.data();
            const borrower = usersSnap.docs.find(u => u.data().userId === loan.borrowerId)?.data();
            activityList.push({
                icon: "hand-holding-usd",
                title: "New Loan Request",
                subtitle: `${borrower?.name || "Unknown"} • LKR ${formatLKR(
                    loan.amountRequested || loan.amountFunded || loan.amount || 0
                )}`,
                color: "#0c6170",
                bg: "#a4e5e0",
                status: loan.status || "pending",
            });
        });

        // Add recent repayments
        repaymentsSnap.docs.slice(0, 2).forEach(doc => {
            const r = doc.data();
            const borrower = usersSnap.docs.find(u => u.data().userId === r.borrowerId)?.data();
            activityList.push({
                icon: "money-bill-wave",
                title: "Repayment Submitted",
                subtitle: `${borrower?.name || "Unknown"} • LKR ${formatLKR(
                    r.totalAmount || r.amount || r.repaymentAmount || 0
                )}`,
                color: "#107869",
                bg: "#dbf5f0",
                status: r.status || "pending",
            });
        });

        // Add escrow transactions
        escrowSnap.docs.slice(0, 2).forEach(doc => {
            const e = doc.data();
            const lender = usersSnap.docs.find(u => u.data().userId === e.lenderId)?.data();
            activityList.push({
                icon: "lock",
                title: "Escrow Activity",
                subtitle: `${lender?.name || "Unknown"} • LKR ${formatLKR(e.amount)}`,
                color: "#d97706",
                bg: "#fef3c7",
                status: e.status || "in review",
            });
        });

        const sortedActivity = activityList.slice(0, 5);

        return {
            totalEscrow: escrowTotal,
            activeLoans,
            overdueLoans,
            successRate,
            recentActivity: sortedActivity,
        };
    } catch (error) {
        console.error("Error loading dashboard:", error);
        return null;
    }
};
