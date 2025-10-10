// screens/onboarding/Onboarding3.js
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import Button from "../../components/Button";

const Onboarding3 = ({ navigation }) => (
  <View style={styles.container}>
    <Image
      source={require("../../assets/images/sdg_no_poverty.png")}
      style={styles.image}
    />
    <Text style={styles.title}>Towards SDG #1: No Poverty</Text>
    <Text style={styles.subtitle}>
      Every small loan helps families break the cycle of poverty — aligning with
      the UN Sustainable Development Goal: No Poverty.
    </Text>
    <Button title="Get Started" onPress={() => navigation.navigate("LoginScreen")} />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  image: { width: 250, height: 250, marginBottom: 30, resizeMode: "contain" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 15 },
  subtitle: { fontSize: 16, textAlign: "center", color: "#555", marginBottom: 40 },
});

export default Onboarding3;
