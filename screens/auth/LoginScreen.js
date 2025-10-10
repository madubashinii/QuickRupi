// screens/auth/LoginScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebaseConfig";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      console.log("Attempting login for:", email);
      await signInWithEmailAndPassword(auth, email, password);
      // Success - navigation will be handled by AppNavigator auth state change
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Login failed. Please check your credentials.";
      if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address.";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password.";
      }
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowerSignUp = () => {
    navigation.navigate("PersonalDetails1");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>QuickRupi</Text>
      <Text style={styles.title}>Welcome back to your{"\n"}QuickRupi account</Text>

      <Text style={styles.label}>Email Address</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Enter Your Email Address"
          placeholderTextColor="#eafaf8"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Ionicons name="mail-outline" size={20} color="#fff" style={styles.icon} />
      </View>

      <Text style={styles.label}>Password</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Enter Your Password"
          placeholderTextColor="#eafaf8"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons 
            name={showPassword ? "eye-off-outline" : "eye-outline"} 
            size={20} 
            color="#fff" 
            style={styles.icon} 
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("ForgotPasswordScreen")}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.loginBtn, loading && styles.disabledBtn]} 
        onPress={handleLogin} 
        disabled={loading}
      >
        <Text style={styles.loginText}>
          {loading ? "Logging in..." : "Log In"}
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Not a Member Yet?</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.signUpBtn} onPress={handleBorrowerSignUp}>
            <Text style={styles.signUpText}>Sign Up | Borrower</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signUpBtn}>
            <Text style={styles.signUpText}>Sign Up | Investor</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

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
    fontSize: 20,
    textAlign: "center",
    color: "#004c4c",
    marginBottom: 30,
  },
  label: {
    alignSelf: "flex-start",
    color: "#003f3f",
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: "#7ad7c1",
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
    height: 45,
    fontSize: 16,
  },
  icon: {
    marginLeft: 10,
  },
  forgotText: {
    color: "#003f3f",
    alignSelf: "flex-start",
    marginVertical: 10,
    fontWeight: "500",
  },
  loginBtn: {
    backgroundColor: "#004c4c",
    borderRadius: 20,
    width: "100%",
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  disabledBtn: {
    backgroundColor: "#7a9c9c",
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    marginTop: 25,
    alignItems: "center",
    width: "100%",
  },
  footerText: {
    color: "#003f3f",
    marginBottom: 10,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  signUpBtn: {
    borderWidth: 1,
    borderColor: "#00a896",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  signUpText: {
    color: "#007f70",
    fontWeight: "500",
  },
});

export default LoginScreen;