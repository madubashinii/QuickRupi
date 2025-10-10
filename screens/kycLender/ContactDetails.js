import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { CheckBox } from "react-native-elements";
import { auth } from "../../services/firebaseConfig";
import { updateLenderDoc } from "../../services/firestoreService";
import { colors } from '../../theme/colors';


export default function ContactDetails({ navigation }) {
  const [permanentAddress, setPermanentAddress] = useState("");
  const [isDifferentAddress, setIsDifferentAddress] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [telephoneNumber, setTelephoneNumber] = useState("");
  const [email, setEmail] = useState("");

  const handleNext = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "Not logged in");
      navigation.replace("Login");
      return;
    }

    if (!permanentAddress || !mobileNumber) {
      Alert.alert("Error", "Please complete required contact details.");
      return;
    }

    try {
      await updateLenderDoc(user.uid, {
        contactDetails: {
          permanentAddress,
          isDifferentAddress,
          mobileNumber,
          telephoneNumber,
          email
        },
        kycStep: 2
      });

      navigation.navigate("EmploymentDetails");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save contact details.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>QuickRupi</Text>
        <Text style={styles.headerSubtitle}>New here? Sign up!</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Contact Details</Text>

        <Text style={styles.label}>Permanent Address</Text>
        <TextInput
          placeholder="Permanent Address"
          value={permanentAddress}
          onChangeText={setPermanentAddress}
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={3}
          placeholderTextColor={colors.textLight}
        />

        <CheckBox
          title="Select if Residential Address differs from Permanent Address"
          checked={isDifferentAddress}
          onPress={() => setIsDifferentAddress(!isDifferentAddress)}
          containerStyle={styles.checkboxContainer}
          textStyle={styles.checkboxText}
          checkedColor={colors.primary}
        />

        <Text style={styles.label}>Mobile Number</Text>
        <TextInput
          placeholder="Mobile Number"
          value={mobileNumber}
          onChangeText={setMobileNumber}
          style={styles.input}
          keyboardType="phone-pad"
          placeholderTextColor={colors.textLight}
        />

        <Text style={styles.label}>Telephone Number</Text>
        <TextInput
          placeholder="Telephone Number"
          value={telephoneNumber}
          onChangeText={setTelephoneNumber}
          style={styles.input}
          keyboardType="phone-pad"
          placeholderTextColor={colors.textLight}
        />

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={colors.textLight}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  checkboxContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    marginLeft: 0,
    marginVertical: 12,
  },
  checkboxText: {
    fontSize: 14,
    fontWeight: 'normal',
    color: colors.text,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  backButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    flex: 0.48,
    alignItems: "center",
  },
  backButtonText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    flex: 0.48,
    alignItems: "center",
  },
  nextButtonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 16,
  },
});