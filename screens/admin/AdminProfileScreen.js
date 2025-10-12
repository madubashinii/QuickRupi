import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import AdminNotificationSettingsModal from "../../components/admin/AdminNotificationSettingsModal";
import { useAuth } from "../../context/AuthContext";

export default function AdminProfileScreen() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(true);
    const [showNotificationSettings, setShowNotificationSettings] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigation = useNavigation();
    const { user, logout } = useAuth();

    useEffect(() => {
        const fetchAdminProfile = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setName(data.fullName || data.name || "");
                    setEmail(data.email || user.email || "");
                    setPhone(data.phone || "");
                } else {
                    console.log("No admin profile found!");
                    // Use email as fallback
                    setEmail(user.email || "");
                }
            } catch (error) {
                console.log("Error fetching profile:", error);
                setEmail(user.email || "");
            } finally {
                setLoading(false);
            }
        };

        fetchAdminProfile();
    }, [user]);

    const handleSave = async () => {
        if (!user) {
            Alert.alert("Error", "No user logged in.");
            return;
        }

        try {
            const docRef = doc(db, "users", user.uid);
            await updateDoc(docRef, { 
                fullName: name,
                name: name,
                email, 
                phone,
                updatedAt: new Date()
            });
            Alert.alert("Profile Updated", "Your profile has been updated successfully.");
        } catch (error) {
            console.log("Error updating profile:", error);
            Alert.alert("Update Failed", "Could not update profile.");
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        setIsLoggingOut(true);
                        try {
                            console.log('Starting admin logout process...');
                            const result = await logout();
                            
                            if (result.success) {
                                console.log('Admin logout successful - redirecting to LoginScreen');
                                // Navigation to LoginScreen will be handled automatically by AppNavigator
                                // when the auth state changes (user becomes null)
                            } else {
                                setIsLoggingOut(false);
                                Alert.alert('Logout Failed', result.error || 'Unable to logout. Please try again.');
                            }
                        } catch (error) {
                            setIsLoggingOut(false);
                            console.error('Logout error:', error);
                            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color="#0c6170" />
                <Text style={{ marginTop: 10, color: "#0c6170" }}>Loading profile...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Admin Profile</Text>
                <Text style={styles.headerSubtitle}>Manage your account</Text>
            </View>

            {/* Profile Avatar */}
            <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {name
                            .split(" ")
                            .map(n => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                    </Text>
                </View>
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
                <TouchableOpacity 
                    style={styles.actionBtn}
                    onPress={() => setShowNotificationSettings(true)}
                >
                    <Ionicons name="notifications-outline" size={20} color="#0c6170" />
                    <Text style={styles.actionText}>Notification Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                    <Ionicons name="lock-closed-outline" size={20} color="#0c6170" />
                    <Text style={styles.actionText}>Change Password</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={handleLogout}>
                    <FontAwesome5 name="sign-out-alt" size={20} color="#dc2626" />
                    <Text style={styles.actionText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <AdminNotificationSettingsModal
                visible={showNotificationSettings}
                onClose={() => setShowNotificationSettings(false)}
                userId={user?.uid}
            />

            {/* Logout Overlay */}
            {isLoggingOut && (
                <View style={styles.logoutOverlay}>
                    <View style={styles.logoutCard}>
                        <ActivityIndicator size="large" color="#0c6170" />
                        <Text style={styles.logoutOverlayText}>Logging out...</Text>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#dbf5f0" },
    header: { paddingTop: 80, paddingBottom: 20, backgroundColor: "#0c6170", alignItems: "center" },
    headerTitle: { fontSize: 22, fontWeight: "700", color: "#fff" },
    headerSubtitle: { fontSize: 14, color: "#a4e5e0", marginTop: 4 },
    avatarContainer: { alignItems: "center", marginVertical: 20 },
    avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 12, borderWidth: 3, borderColor: "#37beb0" },
    role: { fontSize: 14, color: "#107869", marginTop: 2, fontWeight: "600" },
    card: { backgroundColor: "#fff", marginHorizontal: 16, borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: "#0c6170", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, borderWidth: 1, borderColor: "#a4e5e0" },
    cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12, color: "#08313a" },
    label: { fontSize: 14, color: "#107869", marginTop: 10, fontWeight: "600" },
    input: { backgroundColor: "#dbf5f0", padding: 10, borderRadius: 8, marginTop: 4, fontSize: 14, color: "#08313a", borderWidth: 1, borderColor: "#a4e5e0" },
    saveBtn: { backgroundColor: "#0c6170", paddingVertical: 12, borderRadius: 8, marginTop: 16, alignItems: "center", shadowColor: "#0c6170", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    saveText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    actionBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 10, marginBottom: 12, borderRadius: 10, backgroundColor: "#dbf5f0", borderWidth: 1, borderColor: "#a4e5e0" },
    actionText: { fontSize: 14, marginLeft: 12, fontWeight: "600", color: "#08313a" },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 12,
        backgroundColor: "#37beb0",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#fff",
    },
    avatarText: {
        color: "#fff",
        fontSize: 32,
        fontWeight: "700",
    },
    
    // Logout Overlay
    logoutOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    logoutCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    logoutOverlayText: {
        marginTop: 16,
        fontSize: 18,
        color: '#08313a',
        fontWeight: '600',
    },

});
