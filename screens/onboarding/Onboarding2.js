// screens/onboarding/Onboarding2.js
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import Button from "../../components/Button";

const Onboarding2 = ({ navigation }) => (
  <View style={styles.container}>
    <Image
      source={require("../../assets/images/financial_inclusion.png")}
      style={styles.image}
    />
    <Text style={styles.title}>Financial Inclusion for Everyone</Text>
    <Text style={styles.subtitle}>
      Borrowers get affordable loans, lenders make real impact. Together, we
      build sustainable growth.
    </Text>
    <Button title="Next" onPress={() => navigation.navigate("Onboarding3")} />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  image: { width: 250, height: 250, marginBottom: 30, resizeMode: "contain" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 15 },
  subtitle: { fontSize: 16, textAlign: "center", color: "#555", marginBottom: 40 },
});

export default Onboarding2;