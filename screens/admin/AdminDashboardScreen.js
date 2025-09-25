import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function AdminDashboardScreen() {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Admin Dashboard</Text>
                <Text style={styles.headerSubtitle}>Platform Overview & Controls</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>LKR 13.56M</Text>
                        <Text style={styles.statLabel}>Total Escrow</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>23</Text>
                        <Text style={styles.statLabel}>Active Loans</Text>
                    </View>
                    <View style={[styles.statCard, { borderWidth: 2, borderColor: "#dc2626" }]}>
                        <Text style={[styles.statNumber, { color: "#dc2626" }]}>5</Text>
                        <Text style={styles.statLabel}>Overdue</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>89%</Text>
                        <Text style={styles.statLabel}>Success Rate</Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonGrid}>
                    <TouchableOpacity style={styles.actionBtn}
                        onPress={() => navigation.navigate("EscrowApproval")}
                    >
                        <FontAwesome5 name="shield-alt" size={22} color="#667eea" />
                        <Text style={styles.actionLabel}>Escrow</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}
                        onPress={() => navigation.navigate("Repayments")}
                    >
                        <FontAwesome5 name="chart-line" size={22} color="#667eea" />
                        <Text style={styles.actionLabel}>Monitor</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}
                        onPress={() => navigation.navigate("AnalyticsScreen")}
                    >
                        <FontAwesome5 name="chart-pie" size={22} color="#667eea" />
                        <Text style={styles.actionLabel}>Analytics</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => navigation.navigate("UsersManagement")}
                    >
                        <FontAwesome5 name="users" size={22} color="#667eea" />
                        <Text style={styles.actionLabel}>Users</Text>
                    </TouchableOpacity>

                </View>

                {/* Recent Activity */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Recent Activity</Text>

                    {/* Overdue */}
                    <View style={styles.transactionItem}>
                        <View style={styles.transactionLeft}>
                            <View style={[styles.iconCircle, { backgroundColor: "#fef3c7" }]}>
                                <FontAwesome5 name="exclamation-triangle" size={16} color="#d97706" />
                            </View>
                            <View>
                                <Text style={styles.transactionTitle}>Overdue Payment Alert</Text>
                                <Text style={styles.transactionDate}>Loan #LN005 • LKR 225,000</Text>
                            </View>
                        </View>
                        <Text style={[styles.status, { color: "#dc2626" }]}>5 days late</Text>
                    </View>

                    {/* Escrow Released */}
                    <View style={styles.transactionItem}>
                        <View style={styles.transactionLeft}>
                            <View style={[styles.iconCircle, { backgroundColor: "#dcfce7" }]}>
                                <FontAwesome5 name="check-circle" size={16} color="#16a34a" />
                            </View>
                            <View>
                                <Text style={styles.transactionTitle}>Escrow Released</Text>
                                <Text style={styles.transactionDate}>Loan #LN003 • LKR 600,000</Text>
                            </View>
                        </View>
                        <Text style={[styles.status, { color: "#16a34a" }]}>Approved</Text>
                    </View>

                    {/* New User */}
                    <View style={styles.transactionItem}>
                        <View style={styles.transactionLeft}>
                            <View style={[styles.iconCircle, { backgroundColor: "#dbeafe" }]}>
                                <FontAwesome5 name="user-plus" size={16} color="#2563eb" />
                            </View>
                            <View>
                                <Text style={styles.transactionTitle}>New User Registration</Text>
                                <Text style={styles.transactionDate}>Emma Wilson joined</Text>
                            </View>
                        </View>
                        <Text style={[styles.status, { color: "#6b7280" }]}>2 hrs ago</Text>
                    </View>
                </View>

                {/* System Health */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>System Health</Text>
                    <View style={styles.healthGrid}>
                        <View style={styles.healthItem}>
                            <View style={[styles.healthCircle, { backgroundColor: "#dcfce7" }]}>
                                <FontAwesome5 name="server" size={18} color="#16a34a" />
                            </View>
                            <Text style={styles.healthLabel}>API</Text>
                            <Text style={[styles.healthStatus, { color: "#16a34a" }]}>Online</Text>
                        </View>
                        <View style={styles.healthItem}>
                            <View style={[styles.healthCircle, { backgroundColor: "#dcfce7" }]}>
                                <FontAwesome5 name="database" size={18} color="#16a34a" />
                            </View>
                            <Text style={styles.healthLabel}>Database</Text>
                            <Text style={[styles.healthStatus, { color: "#16a34a" }]}>Online</Text>
                        </View>
                        <View style={styles.healthItem}>
                            <View style={[styles.healthCircle, { backgroundColor: "#fef3c7" }]}>
                                <FontAwesome5 name="credit-card" size={18} color="#d97706" />
                            </View>
                            <Text style={styles.healthLabel}>Payments</Text>
                            <Text style={[styles.healthStatus, { color: "#d97706" }]}>Slow</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    header: {
        paddingTop: 40, paddingBottom: 20,
        backgroundColor: "#667eea",
        alignItems: "center",
    },
    headerTitle: { fontSize: 22, fontWeight: "700", color: "#fff" },
    headerSubtitle: { color: "#f0f0f0", marginTop: 5 },

    content: { padding: 16 },

    // Stats
    statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    statCard: {
        flex: 1,
        minWidth: "45%",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
    },
    statNumber: { fontSize: 20, fontWeight: "700", color: "#667eea" },
    statLabel: { fontSize: 12, color: "#6b7280", marginTop: 4 },

    // Action buttons
    buttonGrid: { flexDirection: "row", flexWrap: "wrap", marginVertical: 16, gap: 12 },
    actionBtn: {
        flex: 1,
        minWidth: "45%",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 12,
        alignItems: "center",
        padding: 16,
    },
    actionLabel: { marginTop: 6, fontWeight: "600", color: "#374151" },

    // Cards
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12, color: "#374151" },

    // Transactions
    transactionItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: "#f1f5f9",
    },
    transactionLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    transactionTitle: { fontWeight: "600", color: "#374151" },
    transactionDate: { fontSize: 12, color: "#6b7280" },
    status: { fontSize: 12, fontWeight: "600" },

    // System Health
    healthGrid: { flexDirection: "row", justifyContent: "space-around", marginTop: 12 },
    healthItem: { alignItems: "center" },
    healthCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 6,
    },
    healthLabel: { fontSize: 12, color: "#6b7280" },
    healthStatus: { fontSize: 10, fontWeight: "600" },
});
