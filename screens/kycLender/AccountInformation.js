import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CheckBox } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebaseConfig";
import { colors } from '../../theme/colors';
import { useKyc } from '../../context/KycContext';

export default function AccountInformation({ navigation }) {
  const { kycData, clearKycData } = useKyc();
  const [form, setForm] = useState({ password: "", confirmPassword: "", accepted: false });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.password || !form.confirmPassword) {
      return Alert.alert("Error", "Please complete all fields.");
    }
    if (form.password !== form.confirmPassword) {
      return Alert.alert("Error", "Passwords do not match.");
    }
    if (form.password.length < 6) {
      return Alert.alert("Error", "Password must be at least 6 characters.");
    }
    if (!form.accepted) {
      return Alert.alert("Error", "You must agree to the terms and conditions.");
    }

    const email = kycData.contactDetails?.email;
    if (!email) {
      return Alert.alert("Error", "Email not found. Please go back and enter your email.");
    }

    setLoading(true);
    
    // Timeout to ensure loading stops even if something hangs
    const timeoutId = setTimeout(() => {
      console.error("Request timeout - stopping loading");
      setLoading(false);
      Alert.alert("Timeout", "Request is taking too long. Please check your internet connection and try again.");
    }, 30000); // 30 second timeout

    try {
      console.log("Creating user account with email:", email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, form.password);
      console.log("User created successfully:", userCredential.user.uid);
      
      console.log("Saving user data to Firestore...");
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email, 
        role: "lender", 
        createdAt: new Date().toISOString(),
        kycCompleted: true, 
        kycStatus: "approved", // Auto-approve lender accounts
        kycStep: 4,
        personalDetails: kycData.personalDetails || {},
        contactDetails: kycData.contactDetails || {},
        employmentDetails: kycData.employmentDetails || {},
        accountInformation: { termsAccepted: true }
      });
      console.log("User data saved to Firestore successfully with approved status");
      
      // Sign out the user immediately after account creation
      console.log("Signing out user...");
      await signOut(auth);
      console.log("User signed out successfully");
      
      clearTimeout(timeoutId); // Clear timeout on success
      clearKycData();
      setLoading(false);
      
      Alert.alert(
        "Success", 
        "Registration completed successfully! You can now log in to your investor account.",
        [{ 
          text: "Go to Login", 
          onPress: () => {
            console.log("User clicked Go to Login - will be redirected by onAuthStateChanged");
          }
        }],
        { cancelable: false }
      );
    } catch (err) {
      console.error("Registration error:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      
      clearTimeout(timeoutId); // Clear timeout on error
      setLoading(false);
      
      let errorMessage = "Failed to create account. Please try again.";
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered. Please use a different email or try logging in.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address format.";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Please use at least 6 characters.";
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (err.message) {
        errorMessage = `Registration failed: ${err.message}`;
      }
      
      Alert.alert("Registration Failed", errorMessage);
    }
  };

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
        <Text style={styles.headerSubtitle}>Investor Registration</Text>
        <View style={styles.progress}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.progressText}>Step 4 of 4 - Final Step!</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.titleRow}>
          <Ionicons name="shield-checkmark-outline" size={28} color={colors.tealGreen} />
          <Text style={styles.title}>Account Setup</Text>
        </View>
        <Text style={styles.subtitle}>Create your secure account</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Email Address</Text>
          <View style={styles.emailBox}>
            <Ionicons name="mail-outline" size={20} color={colors.tealGreen} />
            <Text style={styles.emailText}>{kycData.contactDetails?.email || "Not provided"}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Password</Text>
          <Text style={styles.label}>Create Password *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.forestGreen} style={styles.icon} />
            <TextInput
              placeholder="Minimum 6 characters"
              value={form.password}
              onChangeText={(val) => updateField('password', val)}
              style={styles.input}
              placeholderTextColor={colors.gray}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons 
                name={showPassword ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color={colors.forestGreen} 
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>Confirm Password *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.forestGreen} style={styles.icon} />
            <TextInput
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChangeText={(val) => updateField('confirmPassword', val)}
              style={styles.input}
              placeholderTextColor={colors.gray}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
              <Ionicons 
                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color={colors.forestGreen} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Terms & Conditions</Text>
          <ScrollView style={styles.termsScroll} nestedScrollEnabled={true}>
            <Text style={styles.termsText}>
              These lender terms and conditions apply to users who wish to register to lend through the site. 
              A lender is subject to these specific 'Lender Terms and Conditions', which are part of the general 
              Terms and Conditions including the Privacy Policy and General T&C. In the event of any conflict, 
              the Lender T&C shall prevail. Please read carefully as they impose binding legal obligations. 
              By clicking 'I Accept' below, you agree to these terms.
            </Text>
          </ScrollView>
          <CheckBox
            title="I accept the Lender Terms & Conditions, General T&C, and Privacy Policy"
            checked={form.accepted}
            onPress={() => updateField('accepted', !form.accepted)}
            containerStyle={styles.checkbox}
            textStyle={styles.checkboxText}
            checkedColor={colors.tealGreen}
            size={20}
          />
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} disabled={loading}>
            <Ionicons name="arrow-back" size={20} color={colors.tealGreen} />
            <Text style={styles.backTxt}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.submitBtn, loading && styles.disabledBtn]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitTxt}>{loading ? "Creating..." : "Create Account"}</Text>
            <Ionicons name="checkmark-circle" size={20} color={colors.white} />
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
  title: { fontSize: 20, fontWeight: "700", color: colors.deepForestGreen },
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
  emailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.babyBlue,
    padding: 10,
    borderRadius: 8,
    gap: 10,
  },
  emailText: { fontSize: 14, color: colors.deepForestGreen, fontWeight: '600', flex: 1 },
  label: { fontSize: 12, fontWeight: "600", color: colors.forestGreen, marginBottom: 6, marginTop: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.tiffanyBlue,
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 6,
  },
  input: { flex: 1, padding: 10, paddingLeft: 0, fontSize: 14, color: colors.deepForestGreen },
  icon: { marginLeft: 10, marginRight: 6 },
  eyeIcon: { marginRight: 10, padding: 4 },
  termsScroll: { maxHeight: 100, marginBottom: 8 },
  termsText: { fontSize: 11, color: colors.gray, lineHeight: 16 },
  checkbox: { backgroundColor: 'transparent', borderWidth: 0, padding: 0, marginLeft: 0, marginTop: 6 },
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
});
