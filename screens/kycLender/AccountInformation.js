import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, StatusBar } from "react-native";
import { CheckBox } from "react-native-elements";
import { colors } from '../../theme/colors';
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function AccountInformation({ navigation, route }) {
  const { 
    personalData, 
    contactData, 
    employmentData, 
    bankData, 
    documentsData 
  } = route.params;

  const [account, setAccount] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    accepted: false
  });

  const handleChange = (key, value) => setAccount({ ...account, [key]: value });

  const handleSubmit = async () => {
    if (!account.username || !account.password || !account.confirmPassword) {
      Alert.alert("Error", "Please complete all account information.");
      return;
    }

    if (account.password !== account.confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (!account.accepted) {
      Alert.alert("Error", "You must agree to the terms and conditions.");
      return;
    }

    try {
      // Create the Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, contactData.email, account.password);
      const uid = userCredential.user.uid;

      // Create Firestore document with all collected data
      await setDoc(doc(db, "users", uid), {
        personalDetails: personalData,
        contactDetails: contactData,
        employmentDetails: employmentData,
        bankDetails: bankData,
        documents: documentsData,
        accountDetails: {
          username: account.username
        },
        kycCompleted: true,
        step: 3,
        userType: "lender",
        createdAt: new Date()
      });

      Alert.alert("Success", "Registration completed successfully!");
      navigation.replace("Dashboard"); // Navigate to dashboard after signup
    } catch (err) {
      console.error(err);
      Alert.alert("Registration Failed", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>QuickRupi</Text>
        <Text style={styles.headerSubtitle}>New here? Sign up!</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Account Information</Text>

        <TextInput
          placeholder="Username"
          value={account.username}
          style={styles.input}
          onChangeText={(t) => handleChange("username", t)}
          autoCapitalize="none"
          placeholderTextColor={colors.textLight}
        />

        <TextInput
          placeholder="Password"
          value={account.password}
          style={styles.input}
          onChangeText={(t) => handleChange("password", t)}
          secureTextEntry
          autoCapitalize="none"
          placeholderTextColor={colors.textLight}
        />

        <TextInput
          placeholder="Confirm Password"
          value={account.confirmPassword}
          style={styles.input}
          onChangeText={(t) => handleChange("confirmPassword", t)}
          secureTextEntry
          autoCapitalize="none"
          placeholderTextColor={colors.textLight}
        />

        <View style={styles.termsContainer}>
          <Text style={styles.termsTitle}>LENDER'S TERMS OF USE</Text>
          <ScrollView style={styles.termsScroll} nestedScrollEnabled={true}>
            <Text style={styles.termsText}>
              These tender terms and conditions apply to a user who wishes to register to lend through the site (i.e. a 'tender').
              A tender is at all times subject to the specific 'tender terms and conditions' set out below ('Lender T&C'), which are deemed part and parcel of the Terms and Conditions as applicable to him (which include the Privacy Policy (accessed by clicking here) and the General T&C (accessed by clicking here)). In the event of any conflict between the tender T&C and the other applicable components of the Terms and Conditions, the tender T&C shall prevail.
              Please read these Lender T&C carefully. They impose contractual obligations which are binding and enforceable in law, and as such, should be carefully assessed before acceptance. By clicking 'I Accept'
            </Text>
          </ScrollView>

          <CheckBox
            title="I have read and agree to the above Lender T&C (as well as the General T&C & Privacy Policy)"
            checked={account.accepted}
            onPress={() => handleChange("accepted", !account.accepted)}
            containerStyle={styles.checkboxContainer}
            textStyle={styles.checkboxText}
            checkedColor={colors.primary}
          />
        </View>

        <Text style={styles.humanVerification}>Confirm that you are human</Text>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>SUBMIT</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryText}>PREVIOUS</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
    textAlign: "center",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.white,
    textAlign: "center",
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  termsContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    backgroundColor: colors.lightGray,
  },
  termsTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 12,
    color: colors.text,
    textAlign: "center",
  },
  termsScroll: {
    maxHeight: 120,
    marginBottom: 12,
  },
  termsText: {
    fontSize: 14,
    color: colors.textLight,
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
    color: colors.text,
  },
  humanVerification: {
    textAlign: "center",
    marginVertical: 16,
    fontSize: 14,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: colors.success,
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  submitButtonText: {
    color: colors.white,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: colors.lightGray,
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryText: {
    color: colors.primary,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
});