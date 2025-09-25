import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";

const dummyKycData = [
    { id: "1", name: "John Doe", document: "NIC - 123456789V" },
    { id: "2", name: "Jane Smith", document: "Passport - N1234567" },
    { id: "3", name: "Amal Perera", document: "NIC - 987654321V" },
];

export default function KYCApprovalScreen() {
    const [requests, setRequests] = useState(dummyKycData);

    const handleAction = (id, action) => {
        setRequests((prev) => prev.filter((req) => req.id !== id));
        console.log(`${action} KYC for ID: ${id}`);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.doc}>{item.document}</Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.btn, { backgroundColor: "#4CAF50" }]}
                    onPress={() => handleAction(item.id, "Approved")}
                >
                    <Text style={styles.btnText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.btn, { backgroundColor: "#E53935" }]}
                    onPress={() => handleAction(item.id, "Rejected")}
                >
                    <Text style={styles.btnText}>Reject</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>KYC Approval Requests</Text>
            <FlatList
                data={requests}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={styles.empty}>No pending requests 🎉</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: 16 },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 16, color: "#333" },
    card: {
        flexDirection: "row",
        backgroundColor: "#f9f9f9",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: "center",
        elevation: 2,
    },
    name: { fontSize: 18, fontWeight: "600", color: "#222" },
    doc: { fontSize: 14, color: "#555", marginTop: 4 },
    actions: { flexDirection: "row", marginLeft: 12 },
    btn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginLeft: 8,
    },
    btnText: { color: "#fff", fontWeight: "600" },
    empty: { textAlign: "center", marginTop: 40, fontSize: 16, color: "#777" },
});
