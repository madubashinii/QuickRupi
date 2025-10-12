import React, { useState } from "react";
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
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../services/firebaseConfig";
import { colors } from "../../theme/colors";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Success",
        "Password reset email sent! Please check your inbox.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      let errorMessage = "Failed to send reset email. Please try again.";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email address.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address format.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many attempts. Please try again later.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection.";
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
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
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.midnightBlue} />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Ionicons name="lock-closed-outline" size={60} color={colors.midnightBlue} />
            <Text style={styles.logo}>QuickRupi</Text>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              No worries! Enter your email and we'll send you reset instructions.
            </Text>
          </View>

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
                editable={!loading}
              />
            </View>

            <TouchableOpacity 
              style={[styles.sendBtn, loading && styles.disabledBtn]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <>
                  <Text style={styles.sendText}>Send Reset Link</Text>
                  <Ionicons name="send" size={18} color={colors.white} style={styles.sendIcon} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelBtn}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.cancelText}>Back to Login</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.helpContainer}>
            <Ionicons name="information-circle-outline" size={16} color={colors.tealGreen} />
            <Text style={styles.helpText}>
              Remember your password?{" "}
              <Text 
                style={styles.loginLink}
                onPress={() => navigation.goBack()}
              >
                Log in
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default ForgotPasswordScreen;

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
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 8,
    shadowColor: colors.midnightBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    fontSize: 42,
    fontWeight: "900",
    color: colors.midnightBlue,
    marginTop: 15,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: colors.midnightBlue,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: colors.tealGreen,
    fontWeight: "400",
    paddingHorizontal: 10,
    lineHeight: 22,
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
    fontWeight: "600",
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 20,
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
  sendBtn: {
    backgroundColor: colors.midnightBlue,
    borderRadius: 12,
    width: "100%",
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: colors.midnightBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  sendText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  sendIcon: {
    marginLeft: 8,
  },
  cancelBtn: {
    marginTop: 15,
    alignItems: "center",
  },
  cancelText: {
    color: colors.tealGreen,
    fontSize: 15,
    fontWeight: "600",
  },
  helpContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.babyBlue,
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  helpText: {
    color: colors.deepForestGreen,
    fontSize: 14,
    marginLeft: 8,
  },
  loginLink: {
    color: colors.tealGreen,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
