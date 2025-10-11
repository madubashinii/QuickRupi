// screens/onboarding/Onboarding1.js
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import Button from "../../components/Button";

const Onboarding1 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/community.png")}
        style={styles.image}
      />
      <Text style={styles.title}>Welcome to Micro-Loan-Connect</Text>
      <Text style={styles.subtitle}>
        A peer-to-peer microloan platform designed to empower underserved
        communities.
      </Text>
      <Button title="Next" onPress={() => navigation.navigate("Onboarding2")} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  image: { width: 250, height: 250, marginBottom: 30, resizeMode: "contain" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 15 },
  subtitle: { fontSize: 16, textAlign: "center", color: "#555", marginBottom: 40 },
});

export default Onboarding1;