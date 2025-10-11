import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { colors } from '../../theme/colors';

export default function EmploymentDetails({ navigation, route }) {
  const { personalData, contactData } = route.params;
  
  const [form, setForm] = useState({
    employmentStatus: "",
    presentDesignation: "",
  });

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleNext = () => {
    if (!form.employmentStatus) {
      Alert.alert("Error", "Please select employment status.");
      return;
    }

    // Pass data to next screen
    navigation.navigate("BankDetails", {
      personalData: personalData,
      contactData: contactData,
      employmentData: form
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
        <Text style={styles.screenTitle}>Employment Details</Text>

        <Text style={styles.label}>Employment Status</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.employmentStatus}
            onValueChange={(v) => handleChange("employmentStatus", v)}
            style={styles.picker}
          >
            <Picker.Item label="Please select employment status" value="" />
            <Picker.Item label="Salaried" value="Salaried" />
            <Picker.Item label="Self-Employed" value="Self-Employed" />
            <Picker.Item label="Business Owner" value="Business Owner" />
            <Picker.Item label="Unemployed" value="Unemployed" />
            <Picker.Item label="Student" value="Student" />
            <Picker.Item label="Retired" value="Retired" />
          </Picker>
        </View>

        <Text style={styles.label}>Present Designation</Text>
        <TextInput
          placeholder="Present Designation"
          value={form.presentDesignation}
          onChangeText={(t) => handleChange("presentDesignation", t)}
          style={styles.input}
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: colors.background,
  },
  picker: {
    height: 50,
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