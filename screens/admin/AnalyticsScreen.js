import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import PieChart from "../../components/admin/AdminPieChart";

export default function AnalyticsScreen({ navigation }) {
    // Pie chart data
    const repaymentData = [
        { color: "#16a34a", percent: 80 }, // On Time
        { color: "#f59e0b", percent: 10 }, // Late
        { color: "#dc2626", percent: 10 }, // Default
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                >
                    <FontAwesome5 name="arrow-left" size={18} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Analytics & Reports</Text>
                <Text style={styles.subtitle}>Platform performance insights</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Funding Volume Trend */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Funding Volume Trend</Text>
                    <View style={styles.barChart}>
                        {[0.6, 0.8, 0.45, 0.9, 0.7, 0.85, 0.95].map((height, idx) => (
                            <View
                                key={idx}
                                style={[styles.bar, { height: `${height * 100}%` }]}
                            />
                        ))}
                    </View>
                    <View style={styles.barLabels}>
                        {["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
                            (month, idx) => (
                                <Text key={idx} style={styles.barLabel}>
                                    {month}
                                </Text>
                            )
                        )}
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>$125K</Text>
                        <Text style={styles.statLabel}>Total Volume</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>156</Text>
                        <Text style={styles.statLabel}>Active Users</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>89%</Text>
                        <Text style={styles.statLabel}>Success Rate</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>$2.1K</Text>
                        <Text style={styles.statLabel}>Avg. Loan Size</Text>
                    </View>
                </View>

                {/* Repayment Performance */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Repayment Performance</Text>
                    <PieChart size={120} strokeWidth={20} data={repaymentData} />

                    {/* Pie Labels */}
                    <View style={styles.pieLabels}>
                        <View style={styles.pieLabelItem}>
                            <View style={[styles.pieDot, { backgroundColor: "#16a34a" }]} />
                            <Text>On Time</Text>
                            <Text style={styles.piePercent}>80%</Text>
                        </View>
                        <View style={styles.pieLabelItem}>
                            <View style={[styles.pieDot, { backgroundColor: "#f59e0b" }]} />
                            <Text>Late</Text>
                            <Text style={styles.piePercent}>10%</Text>
                        </View>
                        <View style={styles.pieLabelItem}>
                            <View style={[styles.pieDot, { backgroundColor: "#dc2626" }]} />
                            <Text>Default</Text>
                            <Text style={styles.piePercent}>10%</Text>
                        </View>
                    </View>
                </View>

                {/* User Growth */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>User Growth</Text>
                    {[
                        { title: "New Borrowers", value: "+23", percent: "↑ 15%", color: "#16a34a" },
                        { title: "New Lenders", value: "+18", percent: "↑ 12%", color: "#16a34a" },
                        { title: "Total Users", value: "156", percent: "↑ 8%", color: "#16a34a" },
                    ].map((item, idx) => (
                        <View key={idx} style={styles.transactionItem}>
                            <View>
                                <Text style={styles.transactionTitle}>{item.title}</Text>
                                <Text style={styles.transactionDate}>This month</Text>
                            </View>
                            <View style={{ alignItems: "flex-end" }}>
                                <Text style={[styles.transactionAmount, { color: item.color }]}>
                                    {item.value}
                                </Text>
                                <Text style={{ fontSize: 12, color: item.color }}>{item.percent}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Button */}
                <TouchableOpacity style={styles.secondaryBtn}>
                    <FontAwesome5
                        name="download"
                        size={16}
                        color="#667eea"
                        style={{ marginRight: 8 }}
                    />
                    <Text style={styles.secondaryBtnText}>Generate Detailed Report</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    header: {
        paddingTop: 40,
        paddingBottom: 20,
        backgroundColor: "#667eea",
        alignItems: "center",
        position: "relative",
    },
    backBtn: {
        position: "absolute",
        left: 20,
        top: 45,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    title: { fontSize: 22, fontWeight: "700", color: "#fff" },
    subtitle: { color: "#fff", opacity: 0.9, marginTop: 4 },
    content: { padding: 20, paddingBottom: 16 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#f1f5f9",
        elevation: 2,
    },
    cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12, color: "#374151" },

    barChart: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-around",
        height: 120,
        paddingVertical: 10,
        backgroundColor: "#f8fafc",
        borderRadius: 8,
    },
    bar: { width: 20, backgroundColor: "#667eea", borderRadius: 2 },
    barLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    barLabel: { fontSize: 10, color: "#6b7280" },

    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 12,
    },
    statCard: {
        flex: 1,
        minWidth: "45%",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        alignItems: "center",
    },
    statNumber: { fontSize: 20, fontWeight: "700", color: "#667eea" },
    statLabel: { fontSize: 12, color: "#6b7280", marginTop: 4 },

    pieLabels: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
    pieLabelItem: { alignItems: "center" },
    pieDot: { width: 12, height: 12, borderRadius: 6, marginBottom: 5 },
    piePercent: { fontWeight: "600" },

    transactionItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: "#f1f5f9",
    },
    transactionTitle: { fontWeight: "600", color: "#374151" },
    transactionDate: { fontSize: 12, color: "#6b7280" },
    transactionAmount: { fontWeight: "600" },

    secondaryBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#667eea",
        borderRadius: 12,
        padding: 14,
        marginVertical: 20,
    },
    secondaryBtnText: { color: "#667eea", fontWeight: "600", fontSize: 16 },
});
