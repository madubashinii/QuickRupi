import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
// icon set from Expo
import { Ionicons } from "@expo/vector-icons"; 

const BottomNavBar = ({ navigation, activeRoute }) => {
  // activeRoute: name of the current screen for highlighting the active tab

  const tabs = [
    { name: "BorrowerDashboard", label: "Home", icon: "home" },
    { name: "PaymentForm", label: "Pay", icon: "card" },
    { name: "Loans", label: "Records", icon: "list" },
    { name: "Profile", label: "Settings", icon: "settings" },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeRoute === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => navigation.navigate(tab.name)}
          >
            <Ionicons 
              name={tab.icon} 
              size={24} 
              color={isActive ? "#007AFF" : "#999"} 
            />
            <Text style={[styles.label, { color: isActive ? "#007AFF" : "#999" }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
  tab: {
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default BottomNavBar;
