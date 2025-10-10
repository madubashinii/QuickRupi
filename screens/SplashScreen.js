import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Onboarding1"); // Navigate to first onboarding screen
    }, 2000); // Show splash for 2 seconds

    return () => clearTimeout(timer); // Clean up timer
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/logo.png")} // Corrected path
        style={styles.logo}
      />
      <Text style={styles.title}>QuickRupi</Text>
      <Text style={styles.subtitle}>Peer-to-Peer Microloan Platform</Text>
      <ActivityIndicator size="large" color="#004B46" style={{ marginTop: 20 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E6F4F1", // soft mint/teal background
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#073B4C",
  },
  subtitle: {
    fontSize: 16,
    color: "#118AB2",
    marginTop: 5,
    textAlign: "center",
  },
});

export default SplashScreen;
