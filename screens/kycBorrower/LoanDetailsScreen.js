import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { colors } from '../../theme/colors';
import { updateUserDoc } from '../../services/firestoreService';

export default function LoanDetailsScreen({ navigation, route }) {
  const [loan, setLoan] = useState({
    amount: "",
    period: "",
    purpose: "",
    guarantors: "",
  });

  const handleChange = (key, value) => setLoan({ ...loan, [key]: value });

  const handleNext = () => {
    if (!loan.amount || !loan.period || !loan.purpose || !loan.guarantors) {
      alert("Please complete all loan details.");
      return;
    }

    // Pass all collected data to next screen
    navigation.navigate("AccountDetailsScreen", {
      ...route.params,
      loanData: loan
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
        <Text style={styles.screenTitle}>Loan Details</Text>

        <TextInput
          placeholder="Required Loan Amount"
          value={loan.amount}
          keyboardType="numeric"
          style={styles.input}
          onChangeText={(t) => handleChange("amount", t)}
          placeholderTextColor={colors.textLight}
        />

        <Text style={styles.notice}>A Commission fee of 1500 LKR will be deducted from the required loan</Text>

        <TextInput
          placeholder="Re-payment Period (e.g. 3 Months)"
          value={loan.period}
          style={styles.input}
          onChangeText={(t) => handleChange("period", t)}
          placeholderTextColor={colors.textLight}
        />

        <TextInput
          placeholder="Purpose of the Loan"
          value={loan.purpose}
          style={styles.input}
          onChangeText={(t) => handleChange("purpose", t)}
          placeholderTextColor={colors.textLight}
        />

        <Text style={styles.label}>Availability of Guarantors</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={loan.guarantors}
            onValueChange={(v) => handleChange("guarantors", v)}
            style={styles.picker}
          >
            <Picker.Item label="Please select" value="" />
            <Picker.Item label="Yes" value="yes" />
            <Picker.Item label="No" value="no" />
          </Picker>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.secondaryText}>PREVIOUS</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>NEXT STEP</Text>
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
    marginBottom: 12,
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
  notice: {
    color: colors.error,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    fontStyle: 'italic'
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    flex: 0.48,
    alignItems: "center",
  },
  buttonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 16
  },
  secondaryButton: {
    backgroundColor: colors.lightGray,
    padding: 16,
    borderRadius: 8,
    flex: 0.48,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 16
  },
});