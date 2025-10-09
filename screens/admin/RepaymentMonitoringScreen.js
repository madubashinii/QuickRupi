import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import Toast from 'react-native-toast-message';

import {
    fetchRepayments,
    sendReminder,
    sendContact,
    sendBulkReminders,
    exportRepaymentsCSV,
} from "../../services/admin/adminRepaymentService";

export default function RepaymentMonitorScreen({ navigation }) {
    const [activeTab, setActiveTab] = useState("overdue");
    const [overduePayments, setOverduePayments] = useState([]);
    const [dueSoonPayments, setDueSoonPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            // setLoading(true);
            const { overduePayments, dueSoonPayments } = await fetchRepayments();
            setOverduePayments(overduePayments);
            setDueSoonPayments(dueSoonPayments);
            setLoading(false);
        };
        loadData();
    }, []);

    const handleReminder = async (loan) => {
        await sendReminder(loan);
        Toast.show({ type: 'success', text1: 'Reminder Sent', text2: `Reminder sent to ${loan.borrowerName}`, position: 'bottom' });
    };

    const handleContact = async (loan) => {
        await sendContact(loan);
        Toast.show({ type: 'success', text1: 'Notification Sent', text2: `Borrower ${loan.borrowerName} notified.`, position: 'bottom' });
    };

    const renderTransaction = (item, type) => (
        <View
            key={item.repaymentId || item.id}
            style={[styles.transactionItem, type === "overdue" ? styles.overdue : styles.dueSoon]}
        >
            <View style={styles.transactionInfoContainer}>
                <View
                    style={[
                        styles.transactionIcon,
                        type === "overdue"
                            ? { backgroundColor: "#fee2e2" }
                            : { backgroundColor: "#fef3c7" },
                    ]}
                >
                    <FontAwesome5
                        name={type === "overdue" ? "exclamation-triangle" : "clock"}
                        size={16}
                        color={type === "overdue" ? "#dc2626" : "#f59e0b"}
                    />
                </View>
                <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>
                        Loan #{item.loanId} - {item.borrowerName}
                    </Text>
                    <Text style={styles.transactionDate}>
                        Due: {item.dueDate}{" "}
                        {type === "overdue"
                            ? `• ${item.daysLate} days late`
                            : `• ${item.daysLeft} days remaining`}
                    </Text>
                </View>
            </View>
            <View style={styles.transactionRight}>
                <Text style={[styles.transactionAmount, type === "overdue" ? styles.amountNegative : null]}>
                    LKR {item.totalAmount?.toLocaleString()}
                </Text>
                <TouchableOpacity
                    style={[styles.actionBtnSmall, type === "overdue" ? styles.btnContact : styles.btnRemind]}
                    onPress={() => (type === "overdue" ? handleContact(item) : handleReminder(item))}
                >
                    <Text style={styles.btnText}>{type === "overdue" ? "Contact" : "Remind"}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // if (loading) {
    //     return (
    //         <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    //             <ActivityIndicator size="large" color="#0c6170" />
    //             <Text style={{ marginTop: 10, color: "#0c6170" }}>Loading repayments...</Text>
    //         </View>
    //     );
    // }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <FontAwesome5 name="arrow-left" size={18} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Repayment Monitor</Text>
                <Text style={styles.headerSubtitle}>Track payment performance</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>
                            {Math.round(
                                (dueSoonPayments.length + overduePayments.length) === 0
                                    ? 100
                                    : (dueSoonPayments.length / (dueSoonPayments.length + overduePayments.length)) * 100
                            )}
                            %
                        </Text>
                        <Text style={styles.statLabel}>On-Time Rate</Text>
                    </View>
                    <View style={[styles.statCard, styles.statOverdue]}>
                        <Text style={[styles.statNumber, styles.numberOverdue]}>{overduePayments.length}</Text>
                        <Text style={styles.statLabel}>Overdue</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>
                            LKR {overduePayments.reduce((sum, r) => sum + (r.totalAmount || 0), 0).toLocaleString()}
                        </Text>
                        <Text style={styles.statLabel}>Late Payments</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{dueSoonPayments.length}</Text>
                        <Text style={styles.statLabel}>Due This Week</Text>
                    </View>
                </View>

                {/* Filter Tabs */}
                <View style={styles.filterTabs}>
                    {["overdue", "dueSoon", "all"].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.filterTab, activeTab === tab ? styles.tabActive : null]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={activeTab === tab ? styles.tabTextActive : styles.tabText}>
                                {tab === "overdue" ? "Overdue" : tab === "dueSoon" ? "Due Soon" : "All Loans"}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Transactions */}
                {activeTab === "overdue" && overduePayments.map((item) => renderTransaction(item, "overdue"))}
                {activeTab === "dueSoon" && dueSoonPayments.map((item) => renderTransaction(item, "dueSoon"))}
                {activeTab === "all" && (
                    <>
                        {overduePayments.map((item) => renderTransaction(item, "overdue"))}
                        {dueSoonPayments.map((item) => renderTransaction(item, "dueSoon"))}
                    </>
                )}

                {/* Action Buttons */}
                <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={async () => {
                        await sendBulkReminders(overduePayments);
                    }}
                >
                    <FontAwesome5 name="envelope" size={16} color="#fff" />
                    <Text style={styles.primaryBtnText}> Send Reminders</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={async () => {
                        await exportRepaymentsCSV(overduePayments, dueSoonPayments);
                    }}
                >
                    <FontAwesome5 name="download" size={16} color="#0c6170" />
                    <Text style={styles.secondaryBtnText}> Export Report</Text>
                </TouchableOpacity>
            </ScrollView>

            <Toast />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#dbf5f0" },
    header: { paddingTop: 40, paddingBottom: 20, backgroundColor: "#0c6170", alignItems: "center", position: "relative" },
    backBtn: { position: "absolute", left: 20, top: 45, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
    headerTitle: { fontSize: 22, color: "#fff", fontWeight: "700" },
    headerSubtitle: { fontSize: 14, color: "#a4e5e0", marginTop: 4 },
    content: { padding: 20 },
    statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
    statCard: { width: "48%", backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12, alignItems: "center", borderWidth: 1, borderColor: "#a4e5e0" },
    statNumber: { fontSize: 20, fontWeight: "700", color: "#0c6170" },
    statLabel: { fontSize: 12, color: "#107869", marginTop: 4, fontWeight: "600" },
    statOverdue: { borderWidth: 2, borderColor: "#dc2626" },
    numberOverdue: { color: "#dc2626" },
    filterTabs: { flexDirection: "row", marginBottom: 16, marginTop: 8 },
    filterTab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: "#fff", marginRight: 10, borderWidth: 1, borderColor: "#a4e5e0" },
    tabActive: { backgroundColor: "#0c6170", borderColor: "#0c6170" },
    tabText: { color: "#107869", fontWeight: "600" },
    tabTextActive: { color: "#fff", fontWeight: "700" },
    transactionItem: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12, padding: 12, borderRadius: 8, backgroundColor: "#fff", borderWidth: 1, borderColor: "#a4e5e0" },
    transactionInfoContainer: { flexDirection: "row", alignItems: "center", flex: 1 },
    transactionIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", marginRight: 12 },
    transactionInfo: { flex: 1 },
    transactionTitle: { fontWeight: "600", fontSize: 14, color: "#08313a" },
    transactionDate: { fontSize: 12, color: "#107869", marginTop: 2 },
    transactionRight: { alignItems: "flex-end", justifyContent: "center" },
    transactionAmount: { fontWeight: "700", marginBottom: 6, color: "#08313a" },
    amountNegative: { color: "#dc2626" },
    actionBtnSmall: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6 },
    btnContact: { backgroundColor: "#dc2626" },
    btnRemind: { backgroundColor: "#f59e0b" },
    btnText: { color: "#fff", fontSize: 11, fontWeight: "700" },
    primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#0c6170", borderRadius: 12, padding: 16, marginTop: 10 },
    primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16, marginLeft: 8 },
    secondaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#fff", borderRadius: 12, borderWidth: 2, borderColor: "#0c6170", padding: 16, marginTop: 10 },
    secondaryBtnText: { color: "#0c6170", fontWeight: "700", fontSize: 16, marginLeft: 8 },
    overdue: { borderLeftWidth: 4, borderLeftColor: "#dc2626" },
    dueSoon: { borderLeftWidth: 4, borderLeftColor: "#f59e0b" },
});
