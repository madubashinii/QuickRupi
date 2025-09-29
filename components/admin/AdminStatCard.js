import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function AdminStatCard({ number, label }) {
    return (
        <View style={styles.card}>
            <Text style={styles.number}>{number}</Text>
            <Text style={styles.label}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        minWidth: "45%",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#f1f5f9",
    },
    number: { fontSize: 20, fontWeight: "700", color: "#667eea" },
    label: { fontSize: 12, color: "#6b7280", marginTop: 4 },
});
