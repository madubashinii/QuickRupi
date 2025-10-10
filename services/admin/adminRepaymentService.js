import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import dayjs from "dayjs";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from "react-native";
import Toast from 'react-native-toast-message';

/**
 * Fetch repayments and enrich with borrower/loan info
 */

export const fetchRepayments = async () => {
    try {
        const repaymentsSnap = await getDocs(collection(db, "repayments"));
        const repayments = repaymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const borrowerIds = [...new Set(repayments.map(r => r.borrowerId))];
        const loanIds = [...new Set(repayments.map(r => r.loanId))];

        let borrowers = [];
        if (borrowerIds.length > 0) {
            const usersQuery = query(collection(db, "users"), where("userId", "in", borrowerIds));
            const usersSnap = await getDocs(usersQuery);
            borrowers = usersSnap.docs.map(doc => doc.data());
        }

        let loans = [];
        if (loanIds.length > 0) {
            const loansQuery = query(collection(db, "loans"), where("loanId", "in", loanIds));
            const loansSnap = await getDocs(loansQuery);
            loans = loansSnap.docs.map(doc => doc.data());
        }

        const today = dayjs();

        const enrichedRepayments = repayments.map(r => {
            const borrower = borrowers.find(u => u.userId === r.borrowerId);
            const loan = loans.find(l => l.loanId === r.loanId);

            const dueDate = dayjs(r.dueDate);
            const daysDiff = dueDate.diff(today, "day"); // positive if future, negative if past

            let statusType = "dueSoon"; // default for future repayments
            if (daysDiff < 0) statusType = "overdue";
            else if (daysDiff > 7) statusType = "upcoming"; // future > 7 days

            return {
                ...r,
                borrowerName: borrower?.name || "Unknown",
                loanPurpose: loan?.purpose || "",
                daysLate: daysDiff < 0 ? Math.abs(daysDiff) : 0,
                daysLeft: daysDiff >= 0 ? daysDiff : 0,
                statusType,
            };
        });

        const overduePayments = enrichedRepayments.filter(r => r.statusType === "overdue");
        const dueSoonPayments = enrichedRepayments.filter(r => r.statusType === "dueSoon");
        const upcomingPayments = enrichedRepayments.filter(r => r.statusType === "upcoming");

        return { overduePayments, dueSoonPayments, upcomingPayments, allPayments: enrichedRepayments };
    } catch (error) {
        console.error("Error fetching repayments:", error);
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to fetch repayments', position: 'bottom' });
        return { overduePayments: [], dueSoonPayments: [], upcomingPayments: [], allPayments: [] };
    }
};


/**
 * Send single notification to a user
 */
export const sendNotification = async (userId, message) => {
    try {
        await addDoc(collection(db, "notifications"), {
            userId,
            message,
            type: "repaymentReminder",
            isRead: false,
            timestamp: new Date(),
        });
    } catch (error) {
        console.error("Error sending notification:", error);
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to send notification', position: 'bottom' });
    }
};

/**
 * Send reminder for a single repayment
 */
export const sendReminder = async (loan) => {
    const message = `🔔 Reminder: Loan #${loan.loanId} - LKR ${loan.totalAmount?.toLocaleString()} is due on ${loan.dueDate}. ${loan.daysLeft} day(s) remaining.`;
    await sendNotification(loan.borrowerId, message);
    Toast.show({ type: 'success', text1: 'Reminder Sent', text2: `Reminder sent to ${loan.borrowerName}`, position: 'bottom' });
};

/**
 * Send contact notification for overdue repayment
 */
export const sendContact = async (loan) => {
    const message = `📢 Attention: Loan #${loan.loanId} - LKR ${loan.totalAmount?.toLocaleString()} was due on ${loan.dueDate}. Overdue by ${loan.daysLate} day(s). Please contact immediately.`;
    await sendNotification(loan.borrowerId, message);
    Toast.show({ type: 'success', text1: 'Notification Sent', text2: `Borrower ${loan.borrowerName} notified.`, position: 'bottom' });
};

/**
 * Send bulk reminders for all overdue repayments
 */
export const sendBulkReminders = async (overduePayments) => {
    try {
        if (overduePayments.length === 0) {
            Toast.show({ type: 'info', text1: 'No Overdue Payments', text2: 'There are no overdue repayments to remind.', position: 'bottom' });
            return;
        }

        for (const r of overduePayments) {
            const message = `🔔 Loan #${r.loanId} - LKR ${r.totalAmount?.toLocaleString()} was due on ${r.dueDate}. Overdue by ${r.daysLate} day(s). Please make the payment.`;
            await sendNotification(r.borrowerId, message);
        }

        Toast.show({ type: 'success', text1: 'Reminders Sent', text2: `Sent reminders for ${overduePayments.length} overdue payments.`, position: 'bottom' });
    } catch (error) {
        console.error("Error sending reminders:", error);
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to send reminders', position: 'bottom' });
    }
};

/**
 * Export repayments (overdue + dueSoon) to CSV
 */
export const exportRepaymentsCSV = async (overduePayments, dueSoonPayments) => {
    try {
        const allPayments = [...overduePayments, ...dueSoonPayments];

        if (allPayments.length === 0) {
            Toast.show({ type: 'info', text1: 'No Data', text2: 'There are no repayments to export.', position: 'bottom' });
            return;
        }

        const csvHeader = "Loan ID,Borrower,Due Date,Amount,Status,Days Late/Left\n";
        const csvRows = allPayments
            .map(r => `${r.loanId},${r.borrowerName},${r.dueDate},${r.totalAmount},${r.statusType},${r.daysLate || r.daysLeft}`)
            .join("\n");
        const csvString = csvHeader + csvRows;

        if (Platform.OS === "web") {
            const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvString);
            const link = document.createElement("a");
            link.setAttribute("href", csvContent);
            link.setAttribute("download", "repayment_report.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            Toast.show({ type: 'success', text1: 'Export Complete', text2: 'CSV file downloaded.', position: 'bottom' });
        } else {
            const fileUri = FileSystem.cacheDirectory + "repayment_report.csv";
            await FileSystem.writeAsStringAsync(fileUri, csvString, { encoding: FileSystem.EncodingType.UTF8 });
            await Sharing.shareAsync(fileUri, { mimeType: "text/csv", dialogTitle: "Export Repayment Report" });
            Toast.show({ type: 'success', text1: 'Export Complete', text2: 'CSV file ready to share.', position: 'bottom' });
        }
    } catch (error) {
        console.error("Error exporting report:", error);
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to export report.', position: 'bottom' });
    }
};
