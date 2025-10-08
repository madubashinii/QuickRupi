import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    Alert,
} from "react-native";

export default function AdminLoanModal({ loan, onClose, onUpdate }) {
    const [reason, setReason] = useState("");

    const handleApprove = () => {
        Alert.alert("Confirm", `Approve loan #${loan.id}?`, [
            { text: "Cancel" },
            {
                text: "Approve",
                onPress: () => {
                    onUpdate({ ...loan, status: "approved" });
                    onClose();
                },
            },
        ]);
    };

    const handleReject = () => {
        Alert.prompt(
            "Reject Loan",
            "Enter reason for rejection:",
            [
                { text: "Cancel" },
                {
                    text: "Reject",
                    onPress: (text) => {
                        onUpdate({ ...loan, status: "rejected", rejectionReason: text || "No reason provided" });
                        onClose();
                    },
                },
            ],
            "plain-text"
        );
    };

    const handleDisburse = () => {
        Alert.alert("Confirm", `Disburse funds for loan #${loan.id}?`, [
            { text: "Cancel" },
            {
                text: "Disburse",
                onPress: () => {
                    onUpdate({ ...loan, status: "ongoing" });
                    onClose();
                },
            },
        ]);
    };

    const handleCancelApproval = () => {
        Alert.alert("Cancel Approval", "Are you sure you want to cancel approval?", [
            { text: "No" },
            {
                text: "Yes, Cancel",
                onPress: () => {
                    onUpdate({ ...loan, status: "pending" });
                    onClose();
                },
            },
        ]);
    };

    return (
        <Modal visible animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Loan #{loan.id}</Text>
                        <Text style={styles.headerSubtitle}>{loan.borrower}</Text>
                        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                            <Text style={{ fontSize: 20, color: "#fff" }}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.body}>
                        {/* Loan Info */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Loan Information</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Amount</Text>
                                <Text style={styles.value}>LKR {loan.amount.toLocaleString()}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Interest</Text>
                                <Text style={styles.value}>{loan.interestRate}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Term</Text>
                                <Text style={styles.value}>{loan.term}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Risk Level</Text>
                                <Text
                                    style={[
                                        styles.value,
                                        {
                                            color:
                                                loan.riskLevel === "Low"
                                                    ? "#5cd85a" // Lime Green
                                                    : loan.riskLevel === "Medium"
                                                        ? "#f59e0b"
                                                        : "#dc2626",
                                        },
                                    ]}
                                >
                                    {loan.riskLevel}
                                </Text>
                            </View>
                        </View>

                        {/* Borrower */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Borrower Details</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Email</Text>
                                <Text style={styles.value}>{loan.email}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Phone</Text>
                                <Text style={styles.value}>{loan.phone}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Monthly Income</Text>
                                <Text style={styles.value}>{loan.monthlyIncome}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Credit Score</Text>
                                <Text style={styles.value}>{loan.creditScore}</Text>
                            </View>
                        </View>

                        {/* Purpose */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Purpose</Text>
                            <View style={styles.purposeBox}>
                                <Text style={styles.desc}>{loan.purpose}</Text>
                                <Text style={styles.desc}>{loan.description}</Text>
                            </View>
                        </View>

                        {/* Repayment progress */}
                        {loan.status === "ongoing" && loan.repaymentSchedule && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Repayment Progress</Text>
                                <View style={styles.progressBox}>
                                    {loan.repaymentSchedule.map((p, idx) => (
                                        <View key={idx} style={styles.infoRow}>
                                            <Text style={styles.label}>{p.month}</Text>
                                            <Text style={styles.value}>
                                                LKR {p.amount.toLocaleString()} •{" "}
                                                <Text
                                                    style={{
                                                        color:
                                                            p.status === "paid"
                                                                ? "#5cd85a" // Lime Green
                                                                : p.status === "pending"
                                                                    ? "#d97706"
                                                                    : "#dc2626",
                                                        fontWeight: "700"
                                                    }}
                                                >
                                                    {p.status.toUpperCase()}
                                                </Text>
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Action buttons */}
                        <View style={styles.actions}>
                            {loan.status === "pending" && (
                                <>
                                    <TouchableOpacity style={[styles.btn, styles.approve]} onPress={handleApprove}>
                                        <Text style={styles.btnText}>Approve</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.btn, styles.review]}>
                                        <Text style={styles.btnText}>Review</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.btn, styles.reject]} onPress={handleReject}>
                                        <Text style={styles.btnText}>Reject</Text>
                                    </TouchableOpacity>
                                </>
                            )}

                            {loan.status === "approved" && (
                                <>
                                    <TouchableOpacity style={[styles.btn, styles.approve]} onPress={handleDisburse}>
                                        <Text style={styles.btnText}>Disburse</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.btn, styles.reject]}
                                        onPress={handleCancelApproval}
                                    >
                                        <Text style={styles.btnText}>Cancel</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(8, 49, 58, 0.8)",
        justifyContent: "center"
    },
    modal: {
        margin: 20,
        backgroundColor: "#dbf5f0",
        borderRadius: 12,
        overflow: "hidden",
        flex: 1,
        borderWidth: 2,
        borderColor: "#a4e5e0"
    },
    header: {
        padding: 20,
        backgroundColor: "#0c6170",
        alignItems: "center"
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff"
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#a4e5e0",
        marginTop: 4
    },
    closeBtn: {
        position: "absolute",
        top: 15,
        right: 15
    },
    body: {
        padding: 16,
        backgroundColor: "#fff"
    },
    section: {
        marginBottom: 16,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: "#a4e5e0"
    },
    sectionTitle: {
        fontWeight: "700",
        fontSize: 14,
        marginBottom: 8,
        color: "#0c6170"
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
        paddingVertical: 4
    },
    label: {
        fontSize: 12,
        color: "#107869",
        fontWeight: "600"
    },
    value: {
        fontSize: 13,
        fontWeight: "600",
        color: "#08313a"
    },
    purposeBox: {
        backgroundColor: "#dbf5f0",
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: "#37beb0"
    },
    progressBox: {
        backgroundColor: "#dbf5f0",
        padding: 12,
        borderRadius: 8
    },
    desc: {
        fontSize: 13,
        color: "#08313a",
        marginBottom: 6,
        lineHeight: 18
    },
    actions: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 8,
        marginBottom: 20
    },
    btn: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        minWidth: "30%",
        shadowColor: "#0c6170",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3
    },
    btnText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 14
    },
    approve: {
        backgroundColor: "#107869"
    },
    reject: {
        backgroundColor: "#dc2626"
    },
    review: {
        backgroundColor: "#37beb0"
    },
});