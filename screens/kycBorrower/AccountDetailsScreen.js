import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, StatusBar } from "react-native";
import { CheckBox } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";
import { colors } from '../../theme/colors';
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { validateForm, VALIDATION_TYPES, validateField } from '../../utils/validation';
import OTPVerification from '../../components/OTPVerification';

export default function AccountDetailsScreen({ navigation, route }) {
  const { personalData, loanData } = route.params;
  
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
    const updatedAccount = { ...account, [key]: value };
    setAccount(updatedAccount);
    
    // Real-time validation
    if (key === 'password' || key === 'confirmPassword') {
      // Validate both password fields when either changes
      const passwordError = validateField('password', updatedAccount.password, VALIDATION_TYPES.ACCOUNT_INFORMATION, updatedAccount);
      const confirmError = validateField('confirmPassword', updatedAccount.confirmPassword, VALIDATION_TYPES.ACCOUNT_INFORMATION, updatedAccount);
      
      setErrors(prev => ({
        ...prev,
        password: passwordError,
        confirmPassword: confirmError
      }));
    } else {
      const error = validateField(key, value, VALIDATION_TYPES.ACCOUNT_INFORMATION, updatedAccount);
      setErrors(prev => ({
        ...prev,
        [key]: error
      }));
    }
  };

  const handleVerifyEmail = () => {
    // Validate email first
    const emailError = validateField('email', personalData.email, VALIDATION_TYPES.CONTACT_DETAILS);
    if (emailError) {
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
    // Validate all fields
    const { isValid, errors: validationErrors } = validateForm(account, VALIDATION_TYPES.ACCOUNT_INFORMATION);
    
    if (!isValid) {
      setErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      Alert.alert("Validation Error", firstError);
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
      await setDoc(doc(db, "users", uid), {
        personalDetails: personalData,
        loanDetails: loanData,
        accountDetails: {
          username: account.username,
          createdAt: new Date()
        },
        kycCompleted: true,
        step: 3,
        userType: "borrower",
        emailVerified: true,
        emailVerifiedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      Alert.alert(
        "Success", 
        "Registration completed successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate to borrower dashboard
              navigation.reset({
                index: 0,
                routes: [{ name: "BorrowerDashboard" }],
              });
            }
          }
        ]
      );
      
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
    <View style={styles.container}>
      <StatusBar backgroundColor="#d8f4ee" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>QuickRupi</Text>
        <Text style={styles.headerSubtitle}>New here? Sign up!</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Account Information</Text>

        {/* Email Verification Section */}
        <View style={styles.emailSection}>
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

        <View style={styles.termsContainer}>
          <Text style={styles.termsTitle}>BORROWER'S TERMS OF USE</Text>
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
            title="I have read and agree to the above Borrower T&C (as well as the General T&C & Privacy Policy)"
            checked={account.accepted}
            onPress={() => handleChange("accepted", !account.accepted)}
            containerStyle={styles.checkboxContainer}
            textStyle={[styles.checkboxText, errors.accepted && styles.errorText]}
            checkedColor="#004c4c"
            disabled={loading}
          />
        </View>
        {errors.accepted && <Text style={styles.errorText}>{errors.accepted}</Text>}

        {/* Human Verification Checkbox */}
        <View style={[styles.humanVerificationContainer, errors.humanVerified && styles.errorBorder]}>
          <CheckBox
            title="I confirm that I am human"
            checked={account.humanVerified}
            onPress={() => handleChange("humanVerified", !account.humanVerified)}
            containerStyle={styles.humanCheckboxContainer}
            textStyle={[styles.humanCheckboxText, errors.humanVerified && styles.errorText]}
            checkedColor="#004c4c"
            disabled={loading}
          />
        </View>
        {errors.humanVerified && <Text style={styles.errorText}>{errors.humanVerified}</Text>}

        <TouchableOpacity 
          style={[
            styles.submitButton, 
            (loading || !emailVerified) && styles.disabledButton
          ]} 
          onPress={handleSubmit}
          disabled={loading || !emailVerified}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "PROCESSING..." : "COMPLETE REGISTRATION"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.secondaryButton, loading && styles.disabledButton]} 
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.secondaryText}>PREVIOUS</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d8f4ee",
  },
  header: {
    backgroundColor: "#d8f4ee",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#7ad7c1",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#002f2f",
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#004c4c",
    textAlign: "center",
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: 25,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#004c4c",
    marginBottom: 24,
    textAlign: "center",
  },
  emailSection: {
    marginBottom: 20,
  },
  emailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#7ad7c1",
  },
  emailText: {
    fontSize: 16,
    color: "#002f2f",
    flex: 1,
  },
  verifyEmailButton: {
    backgroundColor: "#004c4c",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 12,
  },
  verifiedButton: {
    backgroundColor: "#7ad7c1",
  },
  verifyEmailText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  verifiedText: {
    color: "#002f2f",
  },
  verificationNote: {
    fontSize: 12,
    color: "#7a9c9c",
    marginTop: 4,
    fontStyle: 'italic',
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#003f3f",
    marginBottom: 8,
    marginTop: 12,
    alignSelf: "flex-start",
  },
  input: {
    borderWidth: 1,
    borderColor: "#7ad7c1",
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    color: "#002f2f",
    marginBottom: 12,
    width: "100%",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#7ad7c1",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: "#002f2f",
  },
  eyeIcon: {
    padding: 14,
  },
  termsContainer: {
    borderWidth: 1,
    borderColor: "#7ad7c1",
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    backgroundColor: "#ffffff",
  },
  termsTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 12,
    color: "#002f2f",
    textAlign: "center",
  },
  termsScroll: {
    maxHeight: 120,
    marginBottom: 12,
  },
  termsText: {
    fontSize: 14,
    color: "#7a9c9c",
    lineHeight: 20,
  },
  checkboxContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    marginLeft: 0,
    marginTop: 8,
  },
  checkboxText: {
    fontSize: 14,
    fontWeight: 'normal',
    color: "#002f2f",
  },
  humanVerificationContainer: {
    borderWidth: 1,
    borderColor: "#7ad7c1",
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
    backgroundColor: "#ffffff",
  },
  humanCheckboxContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    marginLeft: 0,
  },
  humanCheckboxText: {
    fontSize: 14,
    fontWeight: '500',
    color: "#002f2f",
  },
  submitButton: {
    backgroundColor: "#004c4c",
    padding: 16,
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 8,
  },
  disabledButton: {
    backgroundColor: "#7a9c9c",
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    padding: 16,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#004c4c",
  },
  secondaryText: {
    color: "#004c4c",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  errorBorder: {
    borderColor: '#ff6b6b',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
});