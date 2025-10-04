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
        borderWidth: 2,
        borderColor: "#a4e5e0",
        shadowColor: "#0c6170",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    number: {
        fontSize: 20,
        fontWeight: "700",
        color: "#0c6170"
    },
    label: {
        fontSize: 12,
        color: "#107869",
        marginTop: 4,
        fontWeight: "600"
    },
});