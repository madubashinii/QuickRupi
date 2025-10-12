import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, StatusBar, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CheckBox } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";
import { colors } from '../../theme/colors';
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebaseConfig";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { validateEmail } from '../../utils/validation';
import OTPVerification from '../../components/OTPVerification';

export default function AccountDetailsScreen({ navigation, route }) {
  const { personalData, loanData = {} } = route.params || {};
  
  const [account, setAccount] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    accepted: false,
    humanVerified: false
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showOTP, setShowOTP] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (key, value) => {
    setAccount({ ...account, [key]: value });
    // Clear error when user types
    if (errors[key]) {
      setErrors({ ...errors, [key]: null });
    }
  };

  const handleVerifyEmail = () => {
    // Validate email first
    if (!personalData.email || !validateEmail(personalData.email)) {
      Alert.alert("Error", "Please check your email address before verification.");
      return;
    }
    
    setShowOTP(true);
  };

  const handleVerificationSuccess = () => {
    setEmailVerified(true);
    setShowOTP(false);
    Alert.alert("Success", "Email verified successfully!");
  };

  const handleSubmit = async () => {
    // Check if personal data exists
    if (!personalData || !personalData.email) {
      Alert.alert("Error", "Personal information is missing. Please go back and complete the form.");
      return;
    }

    // Validate all fields
    if (!account.username || !account.password || !account.confirmPassword) {
      Alert.alert("Error", "Please complete all account fields.");
      return;
    }

    if (account.password !== account.confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (account.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }

    if (!account.accepted) {
      Alert.alert("Error", "You must accept the terms and conditions.");
      return;
    }

    // Check if email is verified
    if (!emailVerified) {
      Alert.alert("Email Verification Required", "Please verify your email address before submitting.");
      return;
    }

    setLoading(true);
    try {
      // Create the Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, personalData.email, account.password);
      const uid = userCredential.user.uid;

      // Create Firestore document with all collected data
      const userData = {
        email: personalData.email,
        role: "borrower", // Changed from userType to match AppNavigator
        personalDetails: personalData,
        accountDetails: {
          username: account.username,
          createdAt: new Date()
        },
        kycCompleted: true,
        kycStatus: "approved", // Borrowers are auto-approved (no admin approval needed)
        kycStep: 3,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Only add loanDetails if it exists and has data
      if (loanData && Object.keys(loanData).length > 0) {
        userData.loanDetails = loanData;
      }

      await setDoc(doc(db, "users", uid), userData);

      // Sign out user so they can login fresh
      await signOut(auth);

      Alert.alert(
        "Success", 
        "Registration completed successfully! Please log in to continue.",
        [{ text: "OK" }]
      );
      
      // AppNavigator will automatically show LoginScreen after signOut
      
    } catch (err) {
      console.error(err);
      let errorMessage = "Registration failed. Please try again.";
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered. Please use a different email.";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Please use a stronger password.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address.";
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection.";
      }
      
      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show OTP verification screen
  if (showOTP) {
    return (
      <OTPVerification
        email={personalData.email}
        onVerificationSuccess={handleVerificationSuccess}
        onBack={() => setShowOTP(false)}
        purpose="registration"
      />
    );
  }

  return (
    <LinearGradient
      colors={[colors.babyBlue, colors.lightGray, colors.white]}
      style={styles.container}
    >
      <StatusBar backgroundColor={colors.tealGreen} barStyle="light-content" />
      
      <LinearGradient
        colors={[colors.tealGreen, colors.midnightBlue]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>QuickRupi</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={styles.headerSubtitle}>Borrower Registration</Text>
        <View style={styles.progress}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.progressText}>Step 2 of 2 - Final Step!</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.titleRow}>
          <Ionicons name="shield-checkmark-outline" size={28} color={colors.tealGreen} />
          <Text style={styles.screenTitle}>Account Setup</Text>
        </View>
        <Text style={styles.subtitle}>Create your secure account</Text>

        <View style={styles.card}>

          <Text style={styles.cardTitle}>Email Verification</Text>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.emailContainer}>
            <Text style={styles.emailText}>{personalData.email}</Text>
            <TouchableOpacity 
              style={[
                styles.verifyEmailButton, 
                emailVerified && styles.verifiedButton
              ]}
              onPress={handleVerifyEmail}
              disabled={emailVerified}
            >
              <Text style={[
                styles.verifyEmailText,
                emailVerified && styles.verifiedText
              ]}>
                {emailVerified ? '✓ Verified' : 'Verify Email'}
              </Text>
            </TouchableOpacity>
          </View>
          {!emailVerified && (
            <Text style={styles.verificationNote}>
              Please verify your email address to continue
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Credentials</Text>
          <Text style={styles.label}>Username</Text>
        <TextInput
          placeholder="Enter your username"
          placeholderTextColor="#7a9c9c"
          value={account.username}
          style={[styles.input, errors.username && styles.errorBorder]}
          onChangeText={(t) => handleChange("username", t)}
          autoCapitalize="none"
          editable={!loading}
        />
        {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

        <Text style={styles.label}>Password</Text>
        <View style={[styles.passwordContainer, errors.password && styles.errorBorder]}>
          <TextInput
            placeholder="Enter your password (min. 8 characters)"
            placeholderTextColor="#7a9c9c"
            value={account.password}
            style={styles.passwordInput}
            onChangeText={(t) => handleChange("password", t)}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            editable={!loading}
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons 
              name={showPassword ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color="#7a9c9c" 
            />
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        <Text style={styles.label}>Confirm Password</Text>
        <View style={[styles.passwordContainer, errors.confirmPassword && styles.errorBorder]}>
          <TextInput
            placeholder="Confirm your password"
            placeholderTextColor="#7a9c9c"
            value={account.confirmPassword}
            style={styles.passwordInput}
            onChangeText={(t) => handleChange("confirmPassword", t)}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            editable={!loading}
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons 
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color="#7a9c9c" 
            />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Terms & Conditions</Text>
          <ScrollView style={styles.termsScroll} nestedScrollEnabled={true}>
            <Text style={styles.termsText}>
              These Borrower terms and conditions apply to a user who wishes to register to obtain a loan through the app.
              A borrower is at all times subject to the specific 'borrower terms and conditions' set out below ('Borrower T&C'), 
              which are deemed part and parcel of the Terms and Conditions as applicable to him (which include the Privacy Policy 
              and the General T&C). In the event of any conflict between the borrower T&C and the other applicable components 
              of the Terms and Conditions, the borrower T&C shall prevail. Please read these Borrower T&C carefully. They impose 
              contractual obligations which are binding and enforceable in law, and as such, should be carefully assessed before acceptance.
            </Text>
          </ScrollView>

          <CheckBox
            title="I accept the Borrower Terms & Conditions, General T&C, and Privacy Policy"
            checked={account.accepted}
            onPress={() => handleChange("accepted", !account.accepted)}
            containerStyle={styles.checkboxContainer}
            textStyle={[styles.checkboxText, errors.accepted && styles.errorText]}
            checkedColor={colors.tealGreen}
            disabled={loading}
          />

          <CheckBox
            title="I confirm that I am human"
            checked={account.humanVerified}
            onPress={() => handleChange("humanVerified", !account.humanVerified)}
            containerStyle={styles.checkboxContainer}
            textStyle={[styles.checkboxText, errors.humanVerified && styles.errorText]}
            checkedColor={colors.tealGreen}
            disabled={loading}
          />
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity 
            style={[styles.backBtn, loading && styles.disabledBtn]} 
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={20} color={colors.tealGreen} />
            <Text style={styles.backTxt}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.submitBtn, 
              (loading || !emailVerified) && styles.disabledBtn
            ]} 
            onPress={handleSubmit}
            disabled={loading || !emailVerified}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <>
                <Text style={styles.submitTxt}>Complete Registration</Text>
                <Ionicons name="checkmark-circle" size={20} color={colors.white} />
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}> All information is encrypted and secure</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 80,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: colors.white, textAlign: "center" },
  headerSubtitle: { fontSize: 11, color: colors.white, textAlign: "center", opacity: 0.95, marginBottom: 10 },
  progress: { marginTop: 6 },
  progressBar: { height: 3, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 1.5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.white, borderRadius: 1.5 },
  progressText: { fontSize: 10, color: colors.white, textAlign: 'center', marginTop: 4, opacity: 0.9 },
  content: { flex: 1 },
  scroll: { padding: 14, paddingBottom: 24 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 8 },
  screenTitle: { fontSize: 20, fontWeight: "700", color: colors.deepForestGreen },
  subtitle: { fontSize: 12, color: colors.gray, marginBottom: 14, fontStyle: 'italic' },
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.tealGreen, marginBottom: 10 },
  emailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.babyBlue,
    padding: 10,
    borderRadius: 8,
    gap: 10,
  },
  emailText: { fontSize: 14, color: colors.deepForestGreen, fontWeight: '600', flex: 1 },
  verifyEmailButton: {
    backgroundColor: colors.tealGreen,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  verifiedButton: { backgroundColor: colors.blueGreen },
  verifyEmailText: { color: colors.white, fontSize: 12, fontWeight: "600" },
  verifiedText: { color: colors.white },
  verificationNote: { fontSize: 11, color: colors.gray, marginTop: 4, fontStyle: 'italic' },
  label: { fontSize: 12, fontWeight: "600", color: colors.forestGreen, marginBottom: 6, marginTop: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.tiffanyBlue,
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
    color: colors.deepForestGreen,
    marginBottom: 6,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.tiffanyBlue,
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 6,
  },
  passwordInput: { flex: 1, padding: 10, fontSize: 14, color: colors.deepForestGreen },
  eyeIcon: { padding: 10 },
  termsScroll: { maxHeight: 100, marginBottom: 8 },
  termsText: { fontSize: 11, color: colors.gray, lineHeight: 16 },
  checkboxContainer: { backgroundColor: 'transparent', borderWidth: 0, padding: 0, marginLeft: 0, marginTop: 6 },
  checkboxText: { fontSize: 11, fontWeight: '500', color: colors.forestGreen },
  btnRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, gap: 10 },
  backBtn: {
    borderWidth: 1.5,
    borderColor: colors.tealGreen,
    backgroundColor: colors.white,
    flexDirection: 'row',
    padding: 11,
    borderRadius: 10,
    flex: 0.35,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  backTxt: { color: colors.tealGreen, fontWeight: "600", fontSize: 14 },
  submitBtn: {
    backgroundColor: colors.tealGreen,
    flexDirection: 'row',
    padding: 11,
    borderRadius: 10,
    flex: 0.65,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: colors.tealGreen,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  submitTxt: { color: colors.white, fontWeight: "700", fontSize: 15 },
  disabledBtn: { opacity: 0.5 },
  footer: { fontSize: 11, color: colors.gray, textAlign: 'center', marginTop: 8, marginBottom: 16, fontStyle: 'italic' },
  errorBorder: { borderColor: colors.red, borderWidth: 1.5 },
  errorText: { color: colors.red, fontSize: 10, marginTop: -2, marginBottom: 6, fontStyle: 'italic' },
});