import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function AdminLoanCard({ loan, onPress }) {
    const statusColors = {
        pending: { border: "#f59e0b", badge: "#fef3c7", text: "#d97706" },
        approved: { border: "#5cd85a", badge: "#a4e5e0", text: "#107869" }, // Lime Green & Tiffany Blue
        ongoing: { border: "#37beb0", badge: "#dbf5f0", text: "#0c6170" }, // Blue Green & Baby Blue
        rejected: { border: "#dc2626", badge: "#fee2e2", text: "#dc2626" },
        completed: { border: "#107869", badge: "#a4e5e0", text: "#1a5653" }, // Teal Green & Tiffany Blue
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
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#a4e5e0",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        shadowColor: "#0c6170",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12
    },
    loanId: {
        fontWeight: "700",
        fontSize: 16,
        color: "#08313a"
    },
    amount: {
        fontWeight: "700",
        fontSize: 18,
        color: "#0c6170"
    },
    details: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8
    },
    label: {
        fontSize: 12,
        color: "#107869",
        fontWeight: "600",
        marginBottom: 4
    },
    value: {
        fontSize: 13,
        fontWeight: "600",
        color: "#08313a"
    },
    badge: {
        marginTop: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        alignSelf: "flex-start",
    },
});