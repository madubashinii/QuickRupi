// UsersManagementScreen.js
import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

const usersData = [
    {
        id: "USR001",
        name: "Sarah Johnson",
        email: "sarah.j@email.com",
        type: "Borrower",
        status: "verified",
        initials: "SJ",
        color: "#667eea",
    },
    {
        id: "USR002",
        name: "Michael Brown",
        email: "michael.b@email.com",
        type: "Lender",
        status: "verified",
        initials: "MB",
        color: "#16a34a",
    },
    {
        id: "USR003",
        name: "John Smith",
        email: "john.smith@email.com",
        type: "Borrower",
        status: "pending",
        initials: "JS",
        color: "#f59e0b",
    },
    {
        id: "USR004",
        name: "Emma Wilson",
        email: "emma.w@email.com",
        type: "Lender",
        status: "new",
        initials: "EW",
        color: "#2563eb",
    },
    {
        id: "USR005",
        name: "Lisa Davis",
        email: "lisa.d@email.com",
        type: "Borrower",
        status: "rejected",
        initials: "LD",
        color: "#dc2626",
    },
    {
        id: "USR006",
        name: "David Miller",
        email: "david.m@email.com",
        type: "Both",
        status: "pending",
        initials: "DM",
        color: "#8b5cf6",
    },
];

export default function UsersManagementScreen({ navigation }) {
    const [users, setUsers] = useState(usersData);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    const handleApproveKYC = (id) => {
        setUsers((prev) =>
            prev.map((u) =>
                u.id === id ? { ...u, status: "verified" } : u
            )
        );
    };

    const filteredUsers = users.filter((u) => {
        const matchesSearch =
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            u.id.toLowerCase().includes(search.toLowerCase());

        const matchesFilter =
            filter === "all" ? true : u.status === filter;

        return matchesSearch && matchesFilter;
    });

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                >
                    <FontAwesome5 name="arrow-left" size={18} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Users Management</Text>
                <Text style={styles.headerSubtitle}>
                    Monitor & manage platform users
                </Text>
            </View>

            <View style={styles.actionBar}>
                <TouchableOpacity
                    style={styles.actionIcon}
                    onPress={() => navigation.navigate("KYCApproval")}
                >
                    <FontAwesome5 name="user-check" size={18} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* Notification */}
                <View style={styles.kycNotification}>
                    <FontAwesome5
                        name="exclamation-triangle"
                        size={16}
                        color="#f59e0b"
                    />
                    <View>
                        <Text style={{ fontWeight: "600", fontSize: 12 }}>
                            3 KYC approvals pending
                        </Text>
                        <Text style={{ fontSize: 10, color: "#6b7280" }}>
                            Click the icon above to review
                        </Text>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{users.length}</Text>
                        <Text style={styles.statLabel}>Total Users</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>
                            {users.filter((u) => u.type === "Borrower").length}
                        </Text>
                        <Text style={styles.statLabel}>Borrowers</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>
                            {users.filter((u) => u.type === "Lender").length}
                        </Text>
                        <Text style={styles.statLabel}>Lenders</Text>
                    </View>
                </View>

                {/* Search */}
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search users by name, email, or ID..."
                    value={search}
                    onChangeText={setSearch}
                />

                {/* Filters */}
                <View style={styles.filterTabs}>
                    {["all", "verified", "pending", "new"].map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[
                                styles.filterTab,
                                filter === f && styles.filterTabActive,
                            ]}
                            onPress={() => setFilter(f)}
                        >
                            <Text
                                style={{
                                    color: filter === f ? "#fff" : "#6b7280",
                                    fontSize: 12,
                                }}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Users List */}
                <View style={styles.card}>
                    <Text style={{ marginBottom: 15, fontWeight: "600" }}>
                        Platform Users
                    </Text>

                    {filteredUsers.map((u) => (
                        <TouchableOpacity key={u.id} style={styles.userItem}>
                            <View
                                style={[
                                    styles.userAvatar,
                                    { backgroundColor: u.color },
                                ]}
                            >
                                <Text style={{ color: "#fff", fontWeight: "700" }}>
                                    {u.initials}
                                </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.userName}>{u.name}</Text>
                                <Text style={styles.userDetails}>
                                    {u.email} • ID: {u.id}
                                </Text>
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity style={[styles.btnSmall, styles.btnView]}>
                                        <Text style={{ color: "#fff", fontSize: 10 }}>View</Text>
                                    </TouchableOpacity>

                                    {u.status === "pending" ? (
                                        <TouchableOpacity
                                            style={[styles.btnSmall, styles.btnVerify]}
                                            onPress={() => handleApproveKYC(u.id)}
                                        >
                                            <Text style={{ color: "#fff", fontSize: 10 }}>
                                                Approve
                                            </Text>
                                        </TouchableOpacity>
                                    ) : u.status === "rejected" ? (
                                        <TouchableOpacity
                                            style={[styles.btnSmall, styles.btnSuspend]}
                                        >
                                            <Text style={{ color: "#fff", fontSize: 10 }}>
                                                Suspended
                                            </Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={[styles.btnSmall, styles.btnVerify]}
                                        >
                                            <Text style={{ color: "#fff", fontSize: 10 }}>
                                                Active
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                            <View style={styles.userStatus}>
                                <Text
                                    style={[
                                        styles.statusBadge,
                                        u.status === "verified" && styles.statusVerified,
                                        u.status === "pending" && styles.statusPending,
                                        u.status === "new" && styles.statusNew,
                                        u.status === "rejected" && styles.statusRejected,
                                    ]}
                                >
                                    {u.status === "verified"
                                        ? "Verified"
                                        : u.status === "pending"
                                            ? "KYC Pending"
                                            : u.status === "new"
                                                ? "New User"
                                                : "KYC Rejected"}
                                </Text>
                                <Text style={styles.userType}>{u.type}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },

    header: { paddingTop: 40, paddingBottom: 20, backgroundColor: '#667eea', alignItems: 'center', position: 'relative' },
    backBtn: { position: 'absolute', left: 20, top: 45, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 22, color: '#fff', fontWeight: '700' },
    headerSubtitle: { color: '#fff', opacity: 0.9, marginTop: 4 },
    actionBar: {
        alignItems: "flex-end",
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: "#f9fafb",
    },
    actionIcon: {
        backgroundColor: "#667eea",
        borderRadius: 20,
        padding: 10,
    },
    kycNotification: {
        backgroundColor: "#fef3c7",
        borderWidth: 1,
        borderColor: "#f59e0b",
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    statsGrid: { flexDirection: "row", justifyContent: "space-between" },
    statCard: {
        flex: 1,
        backgroundColor: "#fff",
        margin: 4,
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#f1f5f9",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    statNumber: { fontSize: 18, fontWeight: "700", color: "#667eea" },
    statLabel: { fontSize: 11, color: "#6b7280" },
    searchBar: {
        borderWidth: 2,
        borderColor: "#e2e8f0",
        borderRadius: 8,
        padding: 10,
        marginVertical: 10,
    },
    filterTabs: { flexDirection: "row", marginBottom: 15, gap: 8 },
    filterTab: {
        backgroundColor: "#f8fafc",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    filterTabActive: { backgroundColor: "#667eea" },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: "#f1f5f9",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    userItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    userAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 15,
    },
    userName: { fontWeight: "600", color: "#374151" },
    userDetails: { fontSize: 12, color: "#6b7280" },
    actionButtons: { flexDirection: "row", gap: 8, marginTop: 5 },
    btnSmall: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    btnView: { backgroundColor: "#667eea" },
    btnVerify: { backgroundColor: "#16a34a" },
    btnSuspend: { backgroundColor: "#dc2626" },
    userStatus: { alignItems: "flex-end" },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        fontSize: 10,
        fontWeight: "600",
        marginBottom: 4,
        overflow: "hidden",
    },
    statusVerified: { backgroundColor: "#dcfce7", color: "#16a34a" },
    statusPending: { backgroundColor: "#fef3c7", color: "#d97706" },
    statusRejected: { backgroundColor: "#fee2e2", color: "#dc2626" },
    statusNew: { backgroundColor: "#dbeafe", color: "#2563eb" },
    userType: { fontSize: 10, color: "#6b7280" },
});
