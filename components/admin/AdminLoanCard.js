import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function AdminLoanCard({ loan, onPress }) {
    const statusColors = {
        pending: { border: "#f59e0b", badge: "#fef3c7", text: "#d97706" },
        approved: { border: "#16a34a", badge: "#dcfce7", text: "#16a34a" },
        ongoing: { border: "#2563eb", badge: "#dbeafe", text: "#2563eb" },
        rejected: { border: "#dc2626", badge: "#fee2e2", text: "#dc2626" },
        completed: { border: "#7c3aed", badge: "#f3e8ff", text: "#7c3aed" },
    };

    const colors = statusColors[loan.status] || statusColors.pending;

    return (
        <TouchableOpacity
            style={[styles.card, { borderLeftColor: colors.border }]}
            onPress={onPress}
        >
            <View style={styles.header}>
                <Text style={styles.loanId}>Loan #{loan.id}</Text>
                <Text style={styles.amount}>LKR {loan.amount.toLocaleString()}</Text>
            </View>

            <View style={styles.details}>
                <View>
                    <Text style={styles.label}>Borrower</Text>
                    <Text style={styles.value}>{loan.borrower}</Text>
                </View>
                <View>
                    <Text style={styles.label}>Purpose</Text>
                    <Text style={styles.value}>{loan.purpose}</Text>
                </View>
            </View>

            <View style={[styles.badge, { backgroundColor: colors.badge }]}>
                <Text style={{ color: colors.text, fontSize: 12, fontWeight: "600" }}>
                    {loan.status.toUpperCase()}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 2,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
    },
    header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
    loanId: { fontWeight: "700", fontSize: 16, color: "#374151" },
    amount: { fontWeight: "700", fontSize: 18, color: "#667eea" },
    details: { flexDirection: "row", justifyContent: "space-between" },
    label: { fontSize: 12, color: "#6b7280" },
    value: { fontSize: 13, fontWeight: "600", color: "#374151" },
    badge: {
        marginTop: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        alignSelf: "flex-start",
    },
});
