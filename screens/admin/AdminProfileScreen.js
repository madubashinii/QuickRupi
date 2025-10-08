import React, { useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

export default function AdminProfileScreen() {
    const [name, setName] = useState("Jane Doe");
    const [email, setEmail] = useState("admin@quickrupi.com");
    const [phone, setPhone] = useState("+94 77 123 4567");

    const handleSave = () => {
        // You can connect this to your backend API
        Alert.alert("Profile Updated", "Your profile has been updated successfully.");
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Admin Profile</Text>
                <Text style={styles.headerSubtitle}>Manage your account</Text>
            </View>

            {/* Profile Avatar */}
            <View style={styles.avatarContainer}>
                <Image
                    source={{ uri: "https://i.pravatar.cc/150?img=12" }}
                    style={styles.avatar}
                />
                <Text style={styles.role}>Administrator</Text>
            </View>

            {/* Editable Profile Info */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Account Information</Text>

                <Text style={styles.label}>Name</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    placeholderTextColor="#107869"
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    placeholderTextColor="#107869"
                />

                <Text style={styles.label}>Phone</Text>
                <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter your phone"
                    keyboardType="phone-pad"
                    placeholderTextColor="#107869"
                />

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveText}>Save Changes</Text>
                </TouchableOpacity>
            </View>

            {/* Other Actions */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Other Actions</Text>
                <TouchableOpacity style={styles.actionBtn}>
                    <Ionicons name="lock-closed-outline" size={20} color="#0c6170" />
                    <Text style={styles.actionText}>Change Password</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                    <FontAwesome5 name="sign-out-alt" size={20} color="#dc2626" />
                    <Text style={styles.actionText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#dbf5f0"
    },

    header: {
        paddingTop: 40,
        paddingBottom: 20,
        backgroundColor: "#0c6170",
        alignItems: "center",
        position: "relative",
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#fff"
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#a4e5e0",
        marginTop: 4
    },

    avatarContainer: {
        alignItems: "center",
        marginVertical: 20
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 12,
        borderWidth: 3,
        borderColor: "#37beb0"
    },
    role: {
        fontSize: 14,
        color: "#107869",
        marginTop: 2,
        fontWeight: "600"
    },

    card: {
        backgroundColor: "#fff",
        marginHorizontal: 16,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#0c6170",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: "#a4e5e0"
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 12,
        color: "#08313a"
    },

    label: {
        fontSize: 14,
        color: "#107869",
        marginTop: 10,
        fontWeight: "600"
    },
    input: {
        backgroundColor: "#dbf5f0",
        padding: 10,
        borderRadius: 8,
        marginTop: 4,
        fontSize: 14,
        color: "#08313a",
        borderWidth: 1,
        borderColor: "#a4e5e0"
    },

    saveBtn: {
        backgroundColor: "#0c6170",
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 16,
        alignItems: "center",
        shadowColor: "#0c6170",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4
    },
    saveText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700"
    },

    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 10,
        marginBottom: 12,
        borderRadius: 10,
        backgroundColor: "#dbf5f0",
        borderWidth: 1,
        borderColor: "#a4e5e0"
    },
    actionText: {
        fontSize: 14,
        marginLeft: 12,
        fontWeight: "600",
        color: "#08313a"
    },
});