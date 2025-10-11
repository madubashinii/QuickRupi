// screens/Dashboard.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, userData, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Welcome to QuickRupi!</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Email: {user?.email}</Text>
        <Text style={styles.infoText}>User Type: {userData?.userType}</Text>
        <Text style={styles.infoText}>KYC Status: Completed </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#d8f4ee",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#002f2f",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#004c4c",
    marginBottom: 30,
  },
  infoContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "100%",
    marginBottom: 30,
  },
  infoText: {
    fontSize: 16,
    color: "#003f3f",
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: "#004c4c",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});