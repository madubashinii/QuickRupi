// screens/auth/LoginScreen.js
import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebaseConfig";
import BiometricService from "../../services/BiometricService";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    const supported = await BiometricService.isBiometricSupported();
    setBiometricSupported(supported.supported);
    
    const enabled = await BiometricService.isBiometricEnabled();
    setBiometricEnabled(enabled);
  };

  const handleLogin = async (userEmail = email, userPassword = password) => {
    if (!userEmail || !userPassword) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, userEmail, userPassword);
      
      // Show biometric prompt after successful login
      if (biometricSupported && !biometricEnabled) {
        showBiometricPrompt(userEmail, userPassword);
      }
      
    } catch (error) {
      let errorMessage = "Wrong credentials. Please check your email and password.";
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email.";
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "Wrong credentials. Please check your email and password.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection.";
      }
      
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    try {
      const authResult = await BiometricService.authenticate();
      
      if (authResult.success) {
        const credentials = await BiometricService.getStoredCredentials();
        if (credentials) {
          await handleLogin(credentials.email, credentials.password);
        } else {
          Alert.alert("Error", "No stored credentials found. Please login with email and password.");
        }
      } else {
        Alert.alert("Authentication Failed", "Please try again or use password to login.");
      }
    } catch (error) {
      Alert.alert("Error", "Biometric authentication failed. Please use password to login.");
    } finally {
      setBiometricLoading(false);
    }
  };

  const showBiometricPrompt = (userEmail, userPassword) => {
    Alert.alert(
      "⚡ Faster Login",
      "Do you want to enable fingerprint/face ID for faster, more secure login?",
      [
        {
          text: "Not Now",
          style: "cancel",
        },
        {
          text: "Enable",
          onPress: async () => {
            const stored = await BiometricService.storeCredentials(userEmail, userPassword);
            if (stored) {
              setBiometricEnabled(true);
              Alert.alert("Success", "Biometric login enabled!");
            }
          },
        },
      ]
    );
  };

  // Development: Manually enable biometric for testing
  const enableBiometricForTesting = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password first");
      return;
    }
    
    const stored = await BiometricService.storeCredentials(email, password);
    if (stored) {
      setBiometricEnabled(true);
      Alert.alert("Development Mode", "Biometric enabled for testing!");
      checkBiometricSupport(); // Refresh the state
    }
  };

  // Development: Clear biometric data
  const clearBiometricForTesting = async () => {
    await BiometricService.clearCredentials();
    setBiometricEnabled(false);
    Alert.alert("Development Mode", "Biometric data cleared!");
    checkBiometricSupport(); // Refresh the state
  };

  const handleBorrowerSignUp = () => {
    navigation.navigate("KycBorrowerStack");
  };

  const handleLenderSignUp = () => {
    navigation.navigate("KycLenderStack");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>QuickRupi</Text>
      <Text style={styles.title}>Welcome back to your{"\n"}QuickRupi account</Text>

      {/* Development Controls - Remove in production */}
      <View style={styles.devControls}>
        <Text style={styles.devTitle}>Development Controls</Text>
        <View style={styles.devButtons}>
          <TouchableOpacity style={styles.devButton} onPress={enableBiometricForTesting}>
            <Text style={styles.devButtonText}>Enable Biometric</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.devButton} onPress={clearBiometricForTesting}>
            <Text style={styles.devButtonText}>Clear Biometric</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.devStatus}>
          Status: {biometricSupported ? 'Supported' : 'Not Supported'} | 
          {biometricEnabled ? ' Enabled' : ' Disabled'}
        </Text>
      </View>

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

      {/* Biometric Login Button */}
      {biometricSupported && biometricEnabled && (
        <TouchableOpacity
          style={[styles.biometricBtn, biometricLoading && styles.disabledBtn]}
          onPress={handleBiometricLogin}
          disabled={biometricLoading}
        >
          {biometricLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="finger-print" size={20} color="#fff" style={styles.biometricIcon} />
              <Text style={styles.biometricText}>Login with Biometrics</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Regular Login Button */}
      <TouchableOpacity
        style={[styles.loginBtn, loading && styles.disabledBtn]}
        onPress={() => handleLogin()}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.loginText}>Log In</Text>
        )}
      </TouchableOpacity>

      {/* Biometric Promo */}
      {biometricSupported && !biometricEnabled && (
        <View style={styles.biometricPromo}>
          <Ionicons name="finger-print" size={16} color="#007f70" />
          <Text style={styles.biometricPromoText}>
            Enable fingerprint/face ID for faster login
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Not a Member Yet?</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.signUpBtn} onPress={handleBorrowerSignUp}>
            <Text style={styles.signUpText}>Sign Up | Borrower</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signUpBtn} onPress={handleLenderSignUp}>
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
    marginBottom: 20,
  },
  // Development Controls
  devControls: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: "100%",
    borderWidth: 2,
    borderColor: "#ffa726",
  },
  devTitle: {
    color: "#ff6b6b",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  devButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  devButton: {
    backgroundColor: "#007f70",
    padding: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  devButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  devStatus: {
    color: "#004c4c",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
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
  biometricBtn: {
    backgroundColor: "#00a896",
    borderRadius: 20,
    width: "100%",
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  biometricIcon: {
    marginRight: 8,
  },
  biometricText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
    opacity: 0.7,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  biometricPromo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#b8f2e6",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    width: "100%",
    justifyContent: "center",
  },
  biometricPromoText: {
    color: "#007f70",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
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