import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.logo}> QuickRupi</Text>

      <Text style={styles.title}>Forgot your{"\n"}password?</Text>
      <Text style={styles.subTitle}>No worries! We will send you an email.</Text>

      <Text style={styles.label}>Email Address</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Enter Your Email Address"
          placeholderTextColor="#eafaf8"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <Ionicons name="mail-outline" size={20} color="#fff" style={styles.icon} />
      </View>

      <TouchableOpacity style={styles.sendBtn}>
        <Text style={styles.sendText}>Send</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d8f4ee",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  logo: {
    fontSize: 22,
    fontWeight: "700",
    color: "#002f2f",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    textAlign: "center",
    color: "#004c4c",
  },
  subTitle: {
    color: "#005f5f",
    marginVertical: 10,
    textAlign: "center",
  },
  label: {
    alignSelf: "flex-start",
    color: "#003f3f",
    marginTop: 10,
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: "#7ad7c1",
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
    height: 45,
  },
  icon: {
    marginLeft: 10,
  },
  sendBtn: {
    backgroundColor: "#004c4c",
    borderRadius: 20,
    width: "100%",
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 20,
  },
  sendText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelText: {
    color: "#003f3f",
    marginTop: 15,
  },
});
