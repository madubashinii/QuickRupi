// screens/auth/LoginScreen.js
import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebaseConfig";
import BiometricService from "../../services/BiometricService";
import { colors } from "../../theme/colors";

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
  // const enableBiometricForTesting = async () => {
  //   if (!email || !password) {
  //     Alert.alert("Error", "Please enter email and password first");
  //     return;
  //   }
  //   
  //   const stored = await BiometricService.storeCredentials(email, password);
  //   if (stored) {
  //     setBiometricEnabled(true);
  //     Alert.alert("Development Mode", "Biometric enabled for testing!");
  //     checkBiometricSupport(); // Refresh the state
  //   }
  // };

  // Development: Clear biometric data
  // const clearBiometricForTesting = async () => {
  //   await BiometricService.clearCredentials();
  //   setBiometricEnabled(false);
  //   Alert.alert("Development Mode", "Biometric data cleared!");
  //   checkBiometricSupport(); // Refresh the state
  // };

  const handleBorrowerSignUp = () => {
    navigation.navigate("KycBorrowerStack");
  };

  const handleLenderSignUp = () => {
    navigation.navigate("KycLenderStack");
  };

  return (
    <LinearGradient
      colors={[colors.babyBlue, colors.white, colors.tiffanyBlue]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <Text style={styles.logo}>QuickRupi</Text>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to your account</Text>
          </View>

          {/* Development Controls - Commented out for production */}
          {/* <View style={styles.devControls}>
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
          </View> */}

          <View style={styles.formContainer}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={colors.midnightBlue} style={styles.iconLeft} />
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor={colors.gray}
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.midnightBlue} style={styles.iconLeft} />
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor={colors.gray}
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
                  color={colors.midnightBlue}
                  style={styles.iconRight}
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
                    <Ionicons name="finger-print" size={22} color="#fff" style={styles.biometricIcon} />
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
                <Ionicons name="finger-print" size={18} color={colors.tealGreen} />
                <Text style={styles.biometricPromoText}>
                  Enable biometric for faster login after signing in
                </Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Not a Member Yet?</Text>
            <View style={styles.row}>
              <TouchableOpacity style={styles.signUpBtn} onPress={handleBorrowerSignUp}>
                <Ionicons name="person-outline" size={16} color={colors.midnightBlue} style={styles.signUpIcon} />
                <Text style={styles.signUpText}>Borrower</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.signUpBtn} onPress={handleLenderSignUp}>
                <Ionicons name="business-outline" size={16} color={colors.midnightBlue} style={styles.signUpIcon} />
                <Text style={styles.signUpText}>Investor</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    fontSize: 42,
    fontWeight: "900",
    color: colors.midnightBlue,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: colors.midnightBlue,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: colors.tealGreen,
    fontWeight: "400",
  },
  formContainer: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 25,
    shadowColor: colors.midnightBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },
  label: {
    color: colors.midnightBlue,
    marginBottom: 8,
    marginTop: 5,
    fontWeight: "600",
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.tiffanyBlue,
  },
  input: {
    flex: 1,
    color: colors.black,
    height: 50,
    fontSize: 16,
    paddingHorizontal: 10,
  },
  iconLeft: {
    marginRight: 5,
  },
  iconRight: {
    marginLeft: 5,
  },
  forgotText: {
    color: colors.tealGreen,
    alignSelf: "flex-end",
    marginBottom: 20,
    fontWeight: "600",
    fontSize: 14,
  },
  biometricBtn: {
    backgroundColor: colors.tealGreen,
    borderRadius: 12,
    width: "100%",
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: colors.tealGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  biometricIcon: {
    marginRight: 10,
  },
  biometricText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  loginBtn: {
    backgroundColor: colors.midnightBlue,
    borderRadius: 12,
    width: "100%",
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 5,
    shadowColor: colors.midnightBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  loginText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  biometricPromo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.babyBlue,
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
    width: "100%",
  },
  biometricPromoText: {
    color: colors.tealGreen,
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
    width: "100%",
  },
  footerText: {
    color: colors.deepForestGreen,
    marginBottom: 15,
    fontWeight: "600",
    fontSize: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  signUpBtn: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.blueGreen,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: colors.blueGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signUpIcon: {
    marginRight: 6,
  },
  signUpText: {
    color: colors.midnightBlue,
    fontWeight: "700",
    fontSize: 14,
  },
  // Development Controls - Commented out
  // devControls: {
  //   backgroundColor: "#fff",
  //   padding: 15,
  //   borderRadius: 10,
  //   marginBottom: 20,
  //   width: "100%",
  //   borderWidth: 2,
  //   borderColor: "#ffa726",
  // },
  // devTitle: {
  //   color: "#ff6b6b",
  //   fontWeight: "bold",
  //   textAlign: "center",
  //   marginBottom: 10,
  // },
  // devButtons: {
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  // },
  // devButton: {
  //   backgroundColor: "#007f70",
  //   padding: 8,
  //   borderRadius: 6,
  //   flex: 1,
  //   marginHorizontal: 5,
  //   alignItems: "center",
  // },
  // devButtonText: {
  //   color: "#fff",
  //   fontSize: 12,
  //   fontWeight: "600",
  // },
  // devStatus: {
  //   color: "#004c4c",
  //   fontSize: 12,
  //   textAlign: "center",
  //   marginTop: 8,
  // },
});

export default LoginScreen;