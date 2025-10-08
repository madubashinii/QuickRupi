import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { fetchKYCRequests, updateKYCStatus } from "../../services/admin/kycService";

export default function KYCApprovalScreen({ navigation }) {
    const [kycRequests, setKycRequests] = useState([]);
    const [approvedCount, setApprovedCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState({ visible: false, action: null, user: null });
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        const unsubscribe = fetchKYCRequests((requests, approved) => {
            setKycRequests(requests);
            setApprovedCount(approved);
            setLoading(false);
        });

        return () => unsubscribe && unsubscribe();
    }, []);

    const handleConfirmAction = async () => {
        const { action, user } = confirmModal;
        if (!user) return;

        const result = await updateKYCStatus(user, action);

        if (result.success) {
            setKycRequests(prev => prev.filter(req => req.id !== user.id));
            setSuccessMsg(result.message);
            setTimeout(() => setSuccessMsg(""), 3000);
        }

        setConfirmModal({ visible: false, action: null, user: null });
    };

    const approveKYC = (user) => setConfirmModal({ visible: true, action: "approve", user });
    const rejectKYC = (user) => setConfirmModal({ visible: true, action: "reject", user });

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color="#107869" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <FontAwesome5 name="arrow-left" size={18} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>KYC Approvals</Text>
                <Text style={styles.headerSubtitle}>Review & approve user verifications</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Stats */}
                <View style={styles.statsSummary}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{kycRequests.length}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{kycRequests.filter(u => u.priority === "urgent").length}</Text>
                        <Text style={styles.statLabel}>Urgent</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{approvedCount}</Text>
                        <Text style={styles.statLabel}>Approved</Text>
                    </View>
                </View>

                {/* Empty State */}
                {kycRequests.length === 0 && (
                    <View style={styles.emptyState}>
                        <FontAwesome5 name="check-circle" size={48} color="#5cd85a" />
                        <Text style={styles.emptyTitle}>All Caught Up!</Text>
                        <Text style={styles.emptySubtitle}>No pending KYC approvals at this time.</Text>
                    </View>
                )}

                {/* KYC Cards */}
                {kycRequests.map(user => (
                    <View key={user.id} style={[styles.kycCard, user.priority === "urgent" ? styles.urgent : styles.normal]}>
                        <View style={styles.kycHeader}>
                            <View style={styles.userAvatar}>
                                <Text style={styles.avatarText}>{user.name[0] + (user.name.split(" ")[1]?.[0] || "")}</Text>
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{user.name}</Text>
                                <Text style={styles.userDetails}>{user.email} • Applied: {user.applied}</Text>
                            </View>
                        </View>

                        <View style={styles.verificationInfo}>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Account Type:</Text>
                                <Text style={styles.infoValue}>{user.accountType}</Text>
                            </View>
                            {user.loanRequest && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Loan Request:</Text>
                                    <Text style={styles.infoValue}>LKR {Number(user.loanRequest).toLocaleString()}</Text>
                                </View>
                            )}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Risk Score:</Text>
                                <Text style={[styles.infoValue, { color: user.riskScore === "High" ? "#dc2626" : user.riskScore === "Medium" ? "#f59e0b" : "#5cd85a" }]}>{user.riskScore}</Text>
                            </View>
                        </View>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.btnApprove} onPress={() => approveKYC(user)}>
                                <FontAwesome5 name="check" size={16} color="#fff" style={{ marginRight: 5 }} />
                                <Text style={styles.btnText}>Approve</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnReject} onPress={() => rejectKYC(user)}>
                                <FontAwesome5 name="times" size={16} color="#fff" style={{ marginRight: 5 }} />
                                <Text style={styles.btnText}>Reject</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                {/* Success Message */}
                {successMsg && (
                    <View style={{ padding: 12, backgroundColor: "#107869", margin: 10, borderRadius: 8 }}>
                        <Text style={{ color: "#fff", textAlign: "center" }}>{successMsg}</Text>
                    </View>
                )}
            </ScrollView>

            {/* Confirmation Modal */}
            <Modal visible={confirmModal.visible} transparent animationType="fade">
                <View style={styles.modalBackground}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{confirmModal.action === "approve" ? "Approve KYC" : "Reject KYC"}</Text>
                        <Text style={{ textAlign: "center", color: "#08313a", marginBottom: 20 }}>
                            {confirmModal.action === "approve"
                                ? `Are you sure you want to approve ${confirmModal.user?.name}'s KYC?`
                                : `Are you sure you want to reject ${confirmModal.user?.name}'s KYC?`}
                        </Text>

                        <View style={{ flexDirection: "row", justifyContent: "center", gap: 10 }}>
                            <TouchableOpacity
                                style={styles.modalBtnClose}
                                onPress={() => setConfirmModal({ visible: false, action: null, user: null })}
                            >
                                <Text style={{ color: "#0c6170", fontWeight: "600" }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalBtnDownload}
                                onPress={handleConfirmAction}
                            >
                                <Text style={{ color: "#fff", fontWeight: "600" }}>{confirmModal.action === "approve" ? "Approve" : "Reject"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#dbf5f0" },
    header: { paddingTop: 40, paddingBottom: 20, backgroundColor: '#0c6170', alignItems: 'center', position: 'relative' },
    backBtn: { position: 'absolute', left: 20, top: 45, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(55, 190, 176, 0.3)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 22, fontWeight: "700", color: "#fff" },
    headerSubtitle: { fontSize: 12, color: "#a4e5e0", marginTop: 4 },
    content: { padding: 16 },
    emptyState: { alignItems: "center", marginTop: 50, backgroundColor: "#fff", padding: 30, borderRadius: 12, borderWidth: 2, borderColor: "#a4e5e0" },
    emptyTitle: { fontSize: 18, fontWeight: "700", marginVertical: 5, color: "#0c6170" },
    emptySubtitle: { color: "#107869", fontSize: 14 },
    kycCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16 },
    urgent: { borderColor: "#dc2626", borderWidth: 2, backgroundColor: "#fef2f2" },
    normal: { borderColor: "#f59e0b", borderWidth: 2, backgroundColor: "#fffbeb" },
    kycHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    userAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#0c6170", alignItems: "center", justifyContent: "center", marginRight: 10 },
    avatarText: { color: "#fff", fontWeight: "700" },
    userInfo: { flex: 1 },
    userName: { fontWeight: "700", fontSize: 16, color: "#08313a" },
    userDetails: { fontSize: 12, color: "#107869" },
    verificationInfo: { marginBottom: 12, backgroundColor: "#dbf5f0", padding: 12, borderRadius: 8 },
    infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
    infoLabel: { fontSize: 12, color: "#107869", fontWeight: "600" },
    infoValue: { fontSize: 12, fontWeight: "600", color: "#08313a" },
    actionButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, gap: 5 },
    btnApprove: { flex: 1, backgroundColor: "#107869", flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 10, borderRadius: 8 },
    btnReject: { flex: 1, backgroundColor: "#dc2626", flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 10, borderRadius: 8 },
    btnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
    modalBackground: { flex: 1, backgroundColor: "rgba(8, 49, 58, 0.8)", justifyContent: "center", alignItems: "center" },
    modalContent: { backgroundColor: "#fff", borderRadius: 12, padding: 20, width: "80%", borderWidth: 2, borderColor: "#a4e5e0" },
    modalTitle: { fontWeight: "700", fontSize: 18, textAlign: "center", color: "#0c6170", marginBottom: 10 },
    modalBtnClose: { flex: 1, padding: 10, borderWidth: 2, borderColor: "#0c6170", borderRadius: 6 },
    modalBtnDownload: { flex: 1, padding: 10, backgroundColor: "#0c6170", borderRadius: 6 },
    statsSummary: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
    statCard: { backgroundColor: "#fff", padding: 12, borderRadius: 8, alignItems: "center", flex: 1, marginHorizontal: 4, borderWidth: 2, borderColor: "#a4e5e0" },
    statNumber: { fontSize: 18, fontWeight: "700", color: "#0c6170" },
    statLabel: { fontSize: 10, color: "#107869", marginTop: 4, fontWeight: "600" },
});

