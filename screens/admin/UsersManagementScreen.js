import React, { useEffect, useState } from "react";
import {
    View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity,
    ActivityIndicator, Modal
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { fetchUsersWithKYC } from "../../services/admin/adminUserService";

export default function UsersManagementScreen({ navigation }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const getData = async () => {
            try {
                const enhancedUsers = await fetchUsersWithKYC();
                setUsers(enhancedUsers);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        getData();
    }, []);

    const filteredUsers = users.filter((u) => {
        const matchesSearch =
            u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase()) ||
            u.userId?.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "all" ? true : u.status === filter;
        return matchesSearch && matchesFilter;
    });

    const pendingCount = users.filter((u) => u.status === "pending").length;

    if (loading) return (
        <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#0c6170" />
            <Text style={{ color: "#0c6170", marginTop: 10 }}>Loading users...</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header + Action Bar */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <FontAwesome5 name="arrow-left" size={18} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Users Management</Text>
                <Text style={styles.headerSubtitle}>Monitor & manage platform users</Text>
            </View>

            <View style={styles.actionBar}>
                <TouchableOpacity style={styles.actionIcon} onPress={() => navigation.navigate("KYCApproval")}>
                    <FontAwesome5 name="user-check" size={18} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* KYC Notification */}
                {pendingCount > 0 && (
                    <View style={styles.kycNotification}>
                        <FontAwesome5 name="exclamation-triangle" size={16} color="#f59e0b" />
                        <View>
                            <Text style={{ fontWeight: "600", fontSize: 12, color: "#08313a" }}>
                                {pendingCount} KYC approvals pending
                            </Text>
                            <Text style={{ fontSize: 10, color: "#107869" }}>Click the icon above to review</Text>
                        </View>
                    </View>
                )}

                {/* Stats */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{users.length}</Text>
                        <Text style={styles.statLabel}>Total Users</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{users.filter(u => u.role === "borrower").length}</Text>
                        <Text style={styles.statLabel}>Borrowers</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{users.filter(u => u.role === "lender").length}</Text>
                        <Text style={styles.statLabel}>Lenders</Text>
                    </View>
                </View>

                {/* Search */}
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search users by name, email, or ID..."
                    placeholderTextColor="#107869"
                    value={search}
                    onChangeText={setSearch}
                />

                {/* Filters */}
                <View style={styles.filterTabs}>
                    {["all", "verified", "pending", "new", "rejected"].map(f => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterTab, filter === f && styles.filterTabActive]}
                            onPress={() => setFilter(f)}
                        >
                            <Text style={{ color: filter === f ? "#fff" : "#107869", fontSize: 12, fontWeight: "600" }}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Users List */}
                <View style={styles.card}>
                    <Text style={{ marginBottom: 15, fontWeight: "600", color: "#0c6170" }}>Platform Users</Text>

                    {filteredUsers.map((u) => (
                        <View key={u.userId} style={styles.userItem}>
                            <View style={[styles.userAvatar, { backgroundColor: "#0c6170" }]}>
                                <Text style={{ color: "#fff", fontWeight: "700" }}>{u.initials}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.userName}>{u.name}</Text>
                                <Text style={styles.userDetails}>{u.email} • ID: {u.userId}</Text>

                                <View style={styles.actionButtons}>
                                    <TouchableOpacity style={[styles.btnSmall, styles.btnView]} onPress={() => setSelectedUser(u)}>
                                        <Text style={{ color: "#fff", fontSize: 10, fontWeight: "600" }}>View</Text>
                                    </TouchableOpacity>

                                    {u.status === "verified" && (
                                        <TouchableOpacity style={[styles.btnSmall, styles.btnVerify]}>
                                            <Text style={{ color: "#fff", fontSize: 10, fontWeight: "600" }}>Active</Text>
                                        </TouchableOpacity>
                                    )}
                                    {u.status === "rejected" && (
                                        <TouchableOpacity style={[styles.btnSmall, styles.btnSuspend]}>
                                            <Text style={{ color: "#fff", fontSize: 10, fontWeight: "600" }}>Suspended</Text>
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
                                <Text style={styles.userType}>{u.role.charAt(0).toUpperCase() + u.role.slice(1)}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Modal */}
            <Modal visible={!!selectedUser} transparent animationType="slide" onRequestClose={() => setSelectedUser(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{selectedUser?.name}</Text>
                        <Text>Email: {selectedUser?.email}</Text>
                        <Text>User ID: {selectedUser?.userId}</Text>
                        <Text>Role: {selectedUser?.role}</Text>
                        <Text>Date of Birth: {selectedUser?.DOB}</Text>
                        <Text>Job: {selectedUser?.job}</Text>
                        <Text>Status: {selectedUser?.status}</Text>

                        {selectedUser?.role === "borrower" && selectedUser?.kyc && (
                            <View style={{ marginTop: 10 }}>
                                <Text style={{ fontWeight: "600", marginBottom: 4 }}>KYC Details:</Text>
                                <Text>Address: {selectedUser.kyc.address}</Text>
                                <Text>Occupation: {selectedUser.kyc.occupation}</Text>
                                <Text>Phone: {selectedUser.kyc.phone}</Text>
                                <Text>
                                    Submitted On: {selectedUser?.submittedAt ? selectedUser.submittedAt.toDate().toLocaleDateString() : "N/A"}
                                </Text>
                                <Text>KYC Status: {selectedUser.kyc.kycStatus}</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.btnSmall, { backgroundColor: "#107869", marginTop: 15 }]}
                            onPress={() => setSelectedUser(null)}
                        >
                            <Text style={{ color: "#fff", fontWeight: "600", textAlign: "center" }}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#dbf5f0" },
    loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: { paddingTop: 80, paddingBottom: 20, backgroundColor: "#0c6170", alignItems: "center", position: "relative" },
    backBtn: { position: "absolute", left: 20, top: 45, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(55, 190, 176, 0.3)", justifyContent: "center", alignItems: "center" },
    headerTitle: { fontSize: 22, color: "#fff", fontWeight: "700" },
    headerSubtitle: { color: "#a4e5e0", opacity: 0.9, marginTop: 4 },
    actionBar: { alignItems: "flex-end", paddingHorizontal: 20, paddingVertical: 10, backgroundColor: "#dbf5f0" },
    actionIcon: { backgroundColor: "#0c6170", borderRadius: 20, padding: 10 },
    kycNotification: { backgroundColor: "#fef3c7", borderWidth: 2, borderColor: "#f59e0b", borderRadius: 8, padding: 12, marginBottom: 15, flexDirection: "row", alignItems: "center", gap: 10 },
    statsGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
    statCard: { flex: 1, backgroundColor: "#fff", margin: 4, padding: 15, borderRadius: 12, alignItems: "center", borderWidth: 2, borderColor: "#a4e5e0" },
    statNumber: { fontSize: 18, fontWeight: "700", color: "#0c6170" },
    statLabel: { fontSize: 11, color: "#107869", fontWeight: "600", marginTop: 4 },
    searchBar: { borderWidth: 2, borderColor: "#a4e5e0", backgroundColor: "#fff", borderRadius: 8, padding: 10, marginVertical: 10, color: "#08313a" },
    filterTabs: { flexDirection: "row", marginBottom: 15, gap: 8 },
    filterTab: { backgroundColor: "#dbf5f0", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "#a4e5e0" },
    filterTabActive: { backgroundColor: "#0c6170", borderColor: "#37beb0" },
    card: { backgroundColor: "#fff", borderRadius: 12, padding: 15, borderWidth: 2, borderColor: "#a4e5e0" },
    userItem: { flexDirection: "row", alignItems: "center", paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#dbf5f0" },
    userAvatar: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", marginRight: 15, borderWidth: 2, borderColor: "#a4e5e0" },
    userName: { fontWeight: "600", color: "#08313a" },
    userDetails: { fontSize: 12, color: "#107869", marginTop: 2 },
    actionButtons: { flexDirection: "row", gap: 8, marginTop: 5 },
    btnSmall: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 },
    btnView: { backgroundColor: "#37beb0" },
    btnVerify: { backgroundColor: "#107869" },
    btnSuspend: { backgroundColor: "#dc2626" },
    userStatus: { alignItems: "flex-end" },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, fontSize: 10, fontWeight: "600", marginBottom: 4, overflow: "hidden" },
    statusVerified: { backgroundColor: "#a4e5e0", color: "#107869" },
    statusPending: { backgroundColor: "#fef3c7", color: "#d97706" },
    statusRejected: { backgroundColor: "#fee2e2", color: "#dc2626" },
    statusNew: { backgroundColor: "#dbf5f0", color: "#0c6170" },
    userType: { fontSize: 10, color: "#107869", fontWeight: "600" },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
    modalContainer: { width: "80%", backgroundColor: "#fff", borderRadius: 12, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
});
