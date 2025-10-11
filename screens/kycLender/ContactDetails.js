import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { CheckBox } from "react-native-elements";
import { colors } from '../../theme/colors';

export default function ContactDetails({ navigation, route }) {
  const { personalData } = route.params;
  
  const [form, setForm] = useState({
    permanentAddress: "",
    isDifferentAddress: false,
    mobileNumber: "",
    telephoneNumber: "",
    email: "",
  });

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleNext = () => {
    if (!form.permanentAddress || !form.mobileNumber) {
      Alert.alert("Error", "Please complete required contact details.");
      return;
    }

    // Pass data to next screen
    navigation.navigate("EmploymentDetails", {
      personalData: personalData,
      contactData: form
    });
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
          value={form.permanentAddress}
          onChangeText={(t) => handleChange("permanentAddress", t)}
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={3}
          placeholderTextColor={colors.textLight}
        />

        <CheckBox
          title="Select if Residential Address differs from Permanent Address"
          checked={form.isDifferentAddress}
          onPress={() => handleChange("isDifferentAddress", !form.isDifferentAddress)}
          containerStyle={styles.checkboxContainer}
          textStyle={styles.checkboxText}
          checkedColor={colors.primary}
        />

        <Text style={styles.label}>Mobile Number</Text>
        <TextInput
          placeholder="Mobile Number"
          value={form.mobileNumber}
          onChangeText={(t) => handleChange("mobileNumber", t)}
          style={styles.input}
          keyboardType="phone-pad"
          placeholderTextColor={colors.textLight}
        />

        <Text style={styles.label}>Telephone Number</Text>
        <TextInput
          placeholder="Telephone Number"
          value={form.telephoneNumber}
          onChangeText={(t) => handleChange("telephoneNumber", t)}
          style={styles.input}
          keyboardType="phone-pad"
          placeholderTextColor={colors.textLight}
        />

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          placeholder="Email Address"
          value={form.email}
          onChangeText={(t) => handleChange("email", t)}
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