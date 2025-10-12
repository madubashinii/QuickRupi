import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { fetchDashboardData } from "../../services/admin/adminDashboardService";
import { subscribeToUnreadCount } from "../../services/notifications/notificationService";
import { subscribeToConversationsForUser } from "../../services/chat";
import { useAuth } from "../../context/AuthContext";

/**
 * Admin Dashboard Screen
 * 
 * Uses actual admin userId from AuthContext
 * - Used for notification subscription
 * - All admin notifications are sent to the logged-in admin user ID
 */
export default function AdminDashboardScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const adminId = user?.uid;
    const [loading, setLoading] = useState(true);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [stats, setStats] = useState({
        totalEscrow: 0,
        activeLoans: 0,
        overdueLoans: 0,
        successRate: 0,
        recentActivity: []
    });

    useEffect(() => {
        if (!adminId) {
            setLoading(false);
            return;
        }

        const loadData = async () => {
            const data = await fetchDashboardData();
            if (data) setStats(data);
            setLoading(false);
        };
        loadData();

        // Subscribe to notifications
        const unsubscribeNotifications = subscribeToUnreadCount(adminId, setUnreadNotifications);
        
        // Subscribe to messages
        const unsubscribeMessages = subscribeToConversationsForUser(adminId, 'admin', (conversations) => {
            const totalUnread = conversations.reduce((sum, conv) => {
                // Only count unread messages for the admin
                // Ensure we only count messages that are actually unread for the admin
                const adminUnreadCount = conv.unreadCount?.[adminId] || 0;
                
                // Additional check: ensure the conversation has the admin as a participant
                const hasAdmin = conv.participantIds?.includes(adminId);
                
                // Debug logging
                if (adminUnreadCount > 0) {
                    console.log(`Admin unread in conversation ${conv.id}:`, {
                        adminUnreadCount,
                        hasAdmin,
                        allUnreadCounts: conv.unreadCount,
                        participants: conv.participants
                    });
                }
                
                return hasAdmin ? sum + adminUnreadCount : sum;
            }, 0);
            
            console.log(`Total admin unread messages: ${totalUnread}`);
            setUnreadMessages(totalUnread);
        });

        return () => {
            unsubscribeNotifications();
            unsubscribeMessages();
        };
    }, [adminId]);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color="#0c6170" />
                <Text style={{ marginTop: 10, color: "#0c6170" }}>Loading dashboard...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0c6170" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Admin Dashboard</Text>
                        <Text style={styles.headerSubtitle}>Platform Overview & Controls</Text>
                    </View>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity 
                            style={styles.iconButton}
                            onPress={() => navigation.navigate('AdminMessages')}
                        >
                            <Ionicons name="chatbubbles" size={24} color="#fff" />
                            {unreadMessages > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {unreadMessages > 99 ? '99+' : unreadMessages}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.iconButton}
                            onPress={() => navigation.navigate('Notifications')}
                        >
                            <Ionicons name="notifications" size={24} color="#fff" />
                            {unreadNotifications > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {unreadNotifications > 99 ? '99+' : unreadNotifications}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: "#dbf5f0" }]}>
                        <FontAwesome5 name="coins" size={20} color="#0c6170" />
                        <Text style={styles.statNumber}>
                            LKR {stats.totalEscrow.toLocaleString()}
                        </Text>
                        <Text style={styles.statLabel}>Total Escrow</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: "#dbf5f0" }]}>
                        <FontAwesome5 name="hand-holding-usd" size={20} color="#107869" />
                        <Text style={styles.statNumber}>{stats.activeLoans}</Text>
                        <Text style={styles.statLabel}>Active Loans</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: "#fee2e2", borderWidth: 2, borderColor: "#dc2626" }]}>
                        <FontAwesome5 name="exclamation-triangle" size={20} color="#dc2626" />
                        <Text style={[styles.statNumber, { color: "#dc2626" }]}>{stats.overdueLoans}</Text>
                        <Text style={styles.statLabel}>Overdue</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: "#dbf5f0" }]}>
                        <FontAwesome5 name="chart-line" size={20} color="#37beb0" />
                        <Text style={styles.statNumber}>{stats.successRate}%</Text>
                        <Text style={styles.statLabel}>Success Rate</Text>
                    </View>
                </View>

                {/* Navigation Buttons */}
                <View style={styles.buttonGrid}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("Repayments")}>
                        <FontAwesome5 name="chart-line" size={22} color="#0c6170" />
                        <Text style={styles.actionLabel}>Repayment</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("UsersManagement")}>
                        <FontAwesome5 name="users" size={22} color="#0c6170" />
                        <Text style={styles.actionLabel}>Users</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent Activity */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Recent Activity</Text>
                    {stats.recentActivity.map((item, idx) => (
                        <View style={styles.transactionItem} key={idx}>
                            <View style={styles.transactionLeft}>
                                <View style={[styles.iconCircle, { backgroundColor: item.bg }]}>
                                    <FontAwesome5 name={item.icon} size={16} color={item.color} />
                                </View>
                                <View>
                                    <Text style={styles.transactionTitle}>{item.title}</Text>
                                    <Text style={styles.transactionDate}>{item.subtitle}</Text>
                                </View>
                            </View>
                            <Text style={[styles.status, { color: item.color }]}>{item.status}</Text>
                        </View>
                    ))}
                </View>

                {/* System Health */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>System Health</Text>
                    <View style={styles.healthGrid}>
                        <View style={styles.healthItem}>
                            <View style={[styles.healthCircle, { backgroundColor: "#a4e5e0" }]} >
                                <FontAwesome5 name="server" size={18} color="#107869" />
                            </View>
                            <Text style={styles.healthLabel}>API</Text>
                            <Text style={[styles.healthStatus, { color: "#5cd85a" }]}>Online</Text>
                        </View>
                        <View style={styles.healthItem}>
                            <View style={[styles.healthCircle, { backgroundColor: "#a4e5e0" }]} >
                                <FontAwesome5 name="database" size={18} color="#107869" />
                            </View>
                            <Text style={styles.healthLabel}>Database</Text>
                            <Text style={[styles.healthStatus, { color: "#5cd85a" }]}>Online</Text>
                        </View>
                        <View style={styles.healthItem}>
                            <View style={[styles.healthCircle, { backgroundColor: "#fef3c7" }]} >
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
    container: { flex: 1, backgroundColor: "#dbf5f0" },
    header: { paddingTop: 80, paddingBottom: 20, backgroundColor: "#0c6170", paddingHorizontal: 16 },
    headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    headerTitle: { fontSize: 22, fontWeight: "700", color: "#fff" },
    headerSubtitle: { color: "#a4e5e0", marginTop: 5 },
    headerButtons: { flexDirection: "row", gap: 12 },
    iconButton: { padding: 8, position: "relative" },
    badge: {
        position: "absolute",
        top: 4,
        right: 4,
        backgroundColor: "#dc2626",
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#0c6170",
        paddingHorizontal: 4,
    },
    badgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
    content: { padding: 16, paddingBottom: 32 },
    statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 },
    statCard: {
        width: "48%",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#a4e5e0",
        shadowColor: "#0c6170",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statNumber: { fontSize: 20, fontWeight: "700", marginTop: 8, color: "#0c6170" },
    statLabel: { fontSize: 12, color: "#107869", marginTop: 4, fontWeight: "600" },
    buttonGrid: { flexDirection: "row", flexWrap: "wrap", marginVertical: 16, justifyContent: "space-between", marginBottom: 16 },
    actionBtn: {
        width: "48%",
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#a4e5e0",
        borderRadius: 12,
        alignItems: "center",
        padding: 16,
        shadowColor: "#0c6170",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    actionLabel: { marginTop: 6, fontWeight: "600", color: "#08313a" },
    card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, borderWidth: 1, borderColor: "#a4e5e0", shadowColor: "#0c6170", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12, color: "#0c6170" },
    transactionItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderColor: "#dbf5f0" },
    transactionLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    transactionTitle: { fontWeight: "600", color: "#08313a" },
    transactionDate: { fontSize: 12, color: "#107869" },
    status: { fontSize: 12, fontWeight: "600" },
    healthGrid: { flexDirection: "row", justifyContent: "space-around", marginTop: 12 },
    healthItem: { alignItems: "center" },
    healthCircle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 6 },
    healthLabel: { fontSize: 12, color: "#107869", fontWeight: "600" },
    healthStatus: { fontSize: 10, fontWeight: "600" },
});
