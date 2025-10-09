// import { collection, getDocs, query, where } from "firebase/firestore";
// import { db } from "../../services/firebaseConfig";

// // Fetch users, loans, repayments, and investments
// export const fetchAnalyticsData = async () => {
//     try {
//         const [usersSnap, loansSnap, repaymentsSnap, investmentsSnap] = await Promise.all([
//             getDocs(collection(db, "users")),
//             getDocs(collection(db, "loans")),
//             getDocs(collection(db, "repayments")),
//             getDocs(collection(db, "investments")),
//         ]);

//         const totalVolume = investmentsSnap.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
//         const activeUsers = usersSnap.docs.length;

//         const totalRepayments = repaymentsSnap.docs.length;
//         const onTimeRepayments = repaymentsSnap.docs.filter(r => r.data().status === "completed").length;
//         const successRate = totalRepayments ? Math.round((onTimeRepayments / totalRepayments) * 100) : 0;

//         const loanAmounts = loansSnap.docs.map(doc => doc.data().amountFunded || doc.data().amountRequested || 0);
//         const avgLoanSize = loanAmounts.length > 0 ? Math.round(loanAmounts.reduce((a, b) => a + b, 0) / loanAmounts.length) : 0;

//         const onTimePercent = totalRepayments ? Math.round((onTimeRepayments / totalRepayments) * 100) : 0;
//         const latePercent = 10;
//         const defaultPercent = totalRepayments ? 100 - onTimePercent - latePercent : 0;

//         const repaymentData = [
//             { color: "#5cd85a", percent: onTimePercent, label: "On Time" },
//             { color: "#f59e0b", percent: latePercent, label: "Late" },
//             { color: "#dc2626", percent: defaultPercent, label: "Default" },
//         ];

//         const thisMonth = new Date().getMonth();
//         const lastMonth = (thisMonth - 1 + 12) % 12;

//         const newBorrowers = usersSnap.docs.filter(u => u.data().role === "borrower" && u.data().createdAt.toDate().getMonth() === thisMonth).length;
//         const newLenders = usersSnap.docs.filter(u => u.data().role === "lender" && u.data().createdAt.toDate().getMonth() === thisMonth).length;

//         const prevBorrowers = usersSnap.docs.filter(u => u.data().role === "borrower" && u.data().createdAt.toDate().getMonth() === lastMonth).length;
//         const prevLenders = usersSnap.docs.filter(u => u.data().role === "lender" && u.data().createdAt.toDate().getMonth() === lastMonth).length;

//         const newBorrowersPercent = prevBorrowers ? Math.round((newBorrowers / prevBorrowers) * 100) : 0;
//         const newLendersPercent = prevLenders ? Math.round((newLenders / prevLenders) * 100) : 0;
//         const totalUsersPercent = 0; // optional

//         return {
//             totalVolume,
//             activeUsers,
//             successRate,
//             avgLoanSize,
//             repaymentData,
//             userGrowth: { newBorrowers, newLenders, totalUsers: activeUsers },
//             userGrowthPercent: { newBorrowers: newBorrowersPercent, newLenders: newLendersPercent, totalUsers: totalUsersPercent },
//         };
//     } catch (error) {
//         console.error("Error fetching analytics data:", error);
//         return null;
//     }
// };
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";


// Helper to safely parse createdAt
const parseDate = (value) => {
    if (!value) return null;
    return value.toDate ? value.toDate() : new Date(value);
};

// Fetch users, loans, repayments, and investments
export const fetchAnalyticsData = async () => {
    try {
        const [usersSnap, loansSnap, repaymentsSnap, investmentsSnap] = await Promise.all([
            getDocs(collection(db, "users")),
            getDocs(collection(db, "loans")),
            getDocs(collection(db, "repayments")),
            getDocs(collection(db, "investments")),
        ]);

        // --- Total Volume ---
        const totalVolume = investmentsSnap.docs.reduce(
            (sum, doc) => sum + (doc.data().amount || 0),
            0
        );

        // --- Active Users ---
        const activeUsers = usersSnap.docs.length;

        // --- Repayments Performance ---
        const totalRepayments = repaymentsSnap.docs.length;
        const onTimeRepayments = repaymentsSnap.docs.filter(r => {
            const data = r.data();
            const repaidAt = parseDate(data.repaidAt || data.paidAt); // in case different field names
            const dueDate = parseDate(data.dueDate);
            return data.status === "completed" && repaidAt && dueDate && repaidAt <= dueDate;
        }).length;

        const lateRepayments = repaymentsSnap.docs.filter(r => {
            const data = r.data();
            const repaidAt = parseDate(data.repaidAt || data.paidAt);
            const dueDate = parseDate(data.dueDate);
            return data.status === "completed" && repaidAt && dueDate && repaidAt > dueDate;
        }).length;

        const defaultRepayments = repaymentsSnap.docs.filter(r => r.data().status !== "completed").length;

        const successRate = totalRepayments ? Math.round((onTimeRepayments / totalRepayments) * 100) : 0;

        const repaymentData = [
            { color: "#5cd85a", percent: totalRepayments ? Math.round((onTimeRepayments / totalRepayments) * 100) : 0, label: "On Time" },
            { color: "#f59e0b", percent: totalRepayments ? Math.round((lateRepayments / totalRepayments) * 100) : 0, label: "Late" },
            { color: "#dc2626", percent: totalRepayments ? Math.round((defaultRepayments / totalRepayments) * 100) : 0, label: "Default" },
        ];

        // --- Average Loan Size ---
        const loanAmounts = loansSnap.docs.map(doc => doc.data().amountFunded || doc.data().amountRequested || 0);
        const avgLoanSize = loanAmounts.length > 0 ? Math.round(loanAmounts.reduce((a, b) => a + b, 0) / loanAmounts.length) : 0;

        // --- User Growth ---
        const thisMonth = new Date().getMonth();
        const lastMonth = (thisMonth - 1 + 12) % 12;

        const newBorrowers = usersSnap.docs.filter(u => {
            const data = u.data();
            if (data.role !== "borrower") return false;

            let createdAt = data.createdAt;
            if (createdAt?.toDate) createdAt = createdAt.toDate();
            else createdAt = new Date(createdAt);

            const now = new Date();
            return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
        }).length;


        const newLenders = usersSnap.docs.filter(u => {
            const data = u.data();
            if (data.role !== "lender") return false;

            let createdAt = data.createdAt;
            if (createdAt?.toDate) createdAt = createdAt.toDate(); // Timestamp
            else createdAt = new Date(createdAt); // string

            const now = new Date();
            return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
        }).length;


        const prevBorrowers = usersSnap.docs.filter(u => {
            const data = u.data();
            if (data.role !== "borrower") return false;
            const createdAt = parseDate(data.createdAt);
            return createdAt && createdAt.getMonth() === lastMonth;
        }).length || 1;

        const prevLenders = usersSnap.docs.filter(u => {
            const data = u.data();
            if (data.role !== "lender") return false;
            const createdAt = parseDate(data.createdAt);
            return createdAt && createdAt.getMonth() === lastMonth;
        }).length || 1;

        const prevTotalUsers = usersSnap.docs.filter(u => {
            const createdAt = parseDate(u.data().createdAt);
            return createdAt && createdAt.getMonth() === lastMonth;
        }).length || 1;

        const newBorrowersPercent = Math.round(((newBorrowers - prevBorrowers) / prevBorrowers) * 100);
        const newLendersPercent = Math.round(((newLenders - prevLenders) / prevLenders) * 100);
        const totalUsersPercent = Math.round(((activeUsers - prevTotalUsers) / prevTotalUsers) * 100);

        return {
            totalVolume,
            activeUsers,
            successRate,
            avgLoanSize,
            repaymentData,
            userGrowth: { newBorrowers, newLenders, totalUsers: activeUsers },
            userGrowthPercent: { newBorrowers: newBorrowersPercent, newLenders: newLendersPercent, totalUsers: totalUsersPercent },
        };
    } catch (error) {
        console.error("Error fetching analytics data:", error);
        return null;
    }
};

