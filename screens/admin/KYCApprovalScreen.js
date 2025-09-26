import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

export default function KYCApprovalScreen({ navigation }) {
    const [kycRequests, setKycRequests] = useState([
        {
            id: "USR003",
            name: "John Smith",
            email: "john.smith@email.com",
            applied: "5 days ago",
            accountType: "Business Borrower",
            loanRequest: "LKR 900,000.00",
            riskScore: "High",
            priority: "urgent",
            documents: ["NIC", "Income", "Business", "Bank"],
        },
        {
            id: "USR006",
            name: "David Miller",
            email: "david.m@email.com",
            applied: "2 days ago",
            accountType: "Personal Lender",
            investmentAmount: "LKR 500,000.00",
            riskScore: "Low",
            priority: "normal",
            documents: ["NIC", "Address", "Income", "Selfie"],
        },
        {
            id: "USR007",
            name: "Anna Thompson",
            email: "anna.t@email.com",
            applied: "1 day ago",
            accountType: "Personal Borrower",
            loanRequest: "LKR 250,000.00",
            riskScore: "Medium",
            priority: "normal",
            documents: ["NIC", "Income", "Bank", "Selfie"],
        },
    ]);

    const [selectedDocument, setSelectedDocument] = useState(null);
    const [approvedCount, setApprovedCount] = useState(142);

    const approveKYC = (user) => {
        Alert.alert("Approve KYC", `KYC approved for ${user.name}`);
        setKycRequests((prev) => prev.filter((req) => req.id !== user.id));
        setApprovedCount((prev) => prev + 1);
    };

    const rejectKYC = (user) => {
        Alert.prompt("Reject KYC", `Enter reason for rejecting ${user.name}:`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "OK",
                onPress: (reason) => {
                    Alert.alert("KYC Rejected", `Rejected ${user.name} - Reason: ${reason || "No reason"}`);
                    setKycRequests((prev) => prev.filter((req) => req.id !== user.id));
                },
            },
        ]);
    };

    const requestMoreInfo = (user) => {
        Alert.alert("Request Info", `Requesting additional info from ${user.name}`);
    };

    const openDocument = (doc, user) => {
        setSelectedDocument({ doc, user });
    };

    const closeDocument = () => {
        setSelectedDocument(null);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                >
                    <FontAwesome5 name="arrow-left" size={18} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>KYC Approvals</Text>
                <Text style={styles.headerSubtitle}>Review & approve user verifications</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Summary Stats */}
                <View style={styles.statsSummary}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{kycRequests.length}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>
                            {kycRequests.filter((u) => u.priority === "urgent").length}
                        </Text>
                        <Text style={styles.statLabel}>Urgent</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{approvedCount}</Text>
                        <Text style={styles.statLabel}>Approved</Text>
                    </View>
                </View>

                {kycRequests.length === 0 && (
                    <View style={styles.emptyState}>
                        <FontAwesome5 name="check-circle" size={48} color="#16a34a" />
                        <Text style={styles.emptyTitle}>All Caught Up!</Text>
                        <Text style={styles.emptySubtitle}>No pending KYC approvals at this time.</Text>
                    </View>
                )}

                {kycRequests.map((user) => (
                    <View
                        key={user.id}
                        style={[
                            styles.kycCard,
                            user.priority === "urgent" ? styles.urgent : styles.normal,
                        ]}
                    >
                        {/* User Info */}
                        <View style={styles.kycHeader}>
                            <View style={styles.userAvatar}>
                                <Text style={styles.avatarText}>{user.name[0] + user.name.split(" ")[1][0]}</Text>
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{user.name}</Text>
                                <Text style={styles.userDetails}>
                                    {user.email} • Applied: {user.applied}
                                </Text>
                            </View>
                            <View
                                style={[
                                    styles.priorityBadge,
                                    user.priority === "urgent" ? styles.priorityUrgent : styles.priorityNormal,
                                ]}
                            >
                                <Text style={styles.badgeText}>
                                    {user.priority === "urgent" ? "URGENT" : "NORMAL"}
                                </Text>
                            </View>
                        </View>

                        {/* Verification Info */}
                        <View style={styles.verificationInfo}>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Account Type:</Text>
                                <Text style={styles.infoValue}>{user.accountType}</Text>
                            </View>
                            {user.loanRequest && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Loan Request:</Text>
                                    <Text style={styles.infoValue}>{user.loanRequest}</Text>
                                </View>
                            )}
                            {user.investmentAmount && (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Investment Amount:</Text>
                                    <Text style={styles.infoValue}>{user.investmentAmount}</Text>
                                </View>
                            )}
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Risk Score:</Text>
                                <Text
                                    style={[
                                        styles.infoValue,
                                        { color: user.riskScore === "High" ? "#dc2626" : user.riskScore === "Medium" ? "#f59e0b" : "#16a34a" },
                                    ]}
                                >
                                    {user.riskScore}
                                </Text>
                            </View>
                        </View>

                        {/* Documents */}
                        <View style={styles.documentGrid}>
                            {user.documents.map((doc) => (
                                <TouchableOpacity
                                    key={doc}
                                    style={styles.documentItem}
                                    onPress={() => openDocument(doc, user.name)}
                                >
                                    <FontAwesome5
                                        name={
                                            doc === "NIC"
                                                ? "id-card"
                                                : doc === "Income"
                                                    ? "file-invoice"
                                                    : doc === "Business"
                                                        ? "building"
                                                        : doc === "Bank"
                                                            ? "university"
                                                            : doc === "Address"
                                                                ? "home"
                                                                : "camera"
                                        }
                                        size={24}
                                        color="#667eea"
                                    />
                                    <Text style={styles.docLabel}>{doc}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Actions */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.btnApprove} onPress={() => approveKYC(user)}>
                                <FontAwesome5 name="check" size={16} color="#fff" style={{ marginRight: 5 }} />
                                <Text style={styles.btnText}>Approve</Text>
                            </TouchableOpacity>
                            {user.priority === "normal" && (
                                <TouchableOpacity style={styles.btnReview} onPress={() => requestMoreInfo(user)}>
                                    <FontAwesome5
                                        name="question-circle"
                                        size={16}
                                        color="#fff"
                                        style={{ marginRight: 5 }}
                                    />
                                    <Text style={styles.btnText}>More Info</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.btnReject} onPress={() => rejectKYC(user)}>
                                <FontAwesome5 name="times" size={16} color="#fff" style={{ marginRight: 5 }} />
                                <Text style={styles.btnText}>Reject</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Document Modal */}
            <Modal visible={!!selectedDocument} transparent animationType="fade">
                <View style={styles.modalBackground}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{selectedDocument?.doc} Document</Text>
                        <FontAwesome5
                            name="file-image"
                            size={48}
                            color="#667eea"
                            style={{ marginVertical: 20, alignSelf: "center" }}
                        />
                        <Text style={{ textAlign: "center", marginBottom: 20 }}>
                            Document for {selectedDocument?.user}
                        </Text>
                        <View style={{ flexDirection: "row", gap: 10 }}>
                            <TouchableOpacity style={styles.modalBtnClose} onPress={closeDocument}>
                                <Text style={{ color: "#667eea", textAlign: "center" }}>Close</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalBtnDownload}
                                onPress={() => {
                                    Alert.alert("Download", `Downloading ${selectedDocument.doc} for ${selectedDocument.user}`);
                                    closeDocument();
                                }}
                            >
                                <Text style={{ color: "#fff", textAlign: "center" }}>Download</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f3f4f6" },
    header: { paddingTop: 40, paddingBottom: 20, backgroundColor: '#667eea', alignItems: 'center', position: 'relative' },
    backBtn: { position: 'absolute', left: 20, top: 45, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 22, fontWeight: "700", color: "#fff" },
    headerSubtitle: { fontSize: 12, color: "#f0f0f0", marginTop: 4 },
    content: { padding: 16 },
    emptyState: { alignItems: "center", marginTop: 50 },
    emptyTitle: { fontSize: 18, fontWeight: "700", marginVertical: 5 },
    emptySubtitle: { color: "#6b7280", fontSize: 14 },
    kycCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
    urgent: { borderColor: "#dc2626", borderWidth: 2 },
    normal: { borderColor: "#f59e0b", borderWidth: 2 },
    kycHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    userAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#667eea",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    avatarText: { color: "#fff", fontWeight: "700" },
    userInfo: { flex: 1 },
    userName: { fontWeight: "700", fontSize: 16, color: "#374151" },
    userDetails: { fontSize: 12, color: "#6b7280" },
    priorityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
    priorityUrgent: { backgroundColor: "#fee2e2" },
    priorityNormal: { backgroundColor: "#fef3c7" },
    badgeText: { fontSize: 10, fontWeight: "600", color: "#dc2626" },
    verificationInfo: { marginBottom: 12 },
    infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
    infoLabel: { fontSize: 12, color: "#6b7280" },
    infoValue: { fontSize: 12, fontWeight: "600", color: "#374151" },
    documentGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
    documentItem: {
        width: "22%",
        padding: 8,
        backgroundColor: "#f8fafc",
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    docLabel: { fontSize: 10, marginTop: 4, textAlign: "center", color: "#6b7280" },
    actionButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, gap: 5 },
    btnApprove: { flex: 1, backgroundColor: "#16a34a", flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 8, borderRadius: 8 },
    btnReject: { flex: 1, backgroundColor: "#dc2626", flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 8, borderRadius: 8 },
    btnReview: { flex: 1, backgroundColor: "#667eea", flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 8, borderRadius: 8 },
    btnText: { color: "#fff", fontWeight: "600", fontSize: 12 },
    modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
    modalContent: { backgroundColor: "#fff", borderRadius: 12, padding: 20, width: "80%" },
    modalTitle: { fontWeight: "700", fontSize: 18, textAlign: "center" },
    modalBtnClose: { flex: 1, padding: 10, borderWidth: 1, borderColor: "#667eea", borderRadius: 6 },
    modalBtnDownload: { flex: 1, padding: 10, backgroundColor: "#667eea", borderRadius: 6 },
    statsSummary: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
    statCard: { backgroundColor: "#fff", padding: 12, borderRadius: 8, alignItems: "center", flex: 1, marginHorizontal: 4 },
    statNumber: { fontSize: 18, fontWeight: "700", color: "#667eea" },
    statLabel: { fontSize: 10, color: "#6b7280", marginTop: 4 },
});
