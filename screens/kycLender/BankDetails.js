import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { auth } from "../../services/firebaseConfig";
import { updateLenderDoc } from "../../services/firestoreService";

export default function BankDetails({ navigation }) {
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const handleNext = async () => {
    const user = auth.currentUser;
    if (!user) { 
      Alert.alert("Error", "Not logged in"); 
      navigation.replace("Login"); 
      return; 
    }
    
    if (!bankName || !branchName || !accountNumber) {
      Alert.alert("Error", "Please complete all bank details.");
      return;
    }

    try {
      await updateLenderDoc(user.uid, {
        bankDetails: { 
          bankName, 
          branchName, 
          accountNumber 
        },
        kycStep: 4
      });

      navigation.navigate("Documents");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save bank details.");
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
        <Text style={styles.screenTitle}>Bank Account</Text>

        <Text style={styles.label}>Bank Name</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={bankName}
            onValueChange={setBankName}
            style={styles.picker}
          >
            <Picker.Item label="Please select your bank" value="" />
            <Picker.Item label="Amana Bank PLC" value="Amana Bank PLC" />
            <Picker.Item label="Bank of Ceylon" value="Bank of Ceylon" />
            <Picker.Item label="People's Bank" value="People's Bank" />
            <Picker.Item label="Commercial Bank" value="Commercial Bank" />
            <Picker.Item label="Hatton National Bank" value="Hatton National Bank" />
            <Picker.Item label="Sampath Bank" value="Sampath Bank" />
            <Picker.Item label="National Savings Bank" value="National Savings Bank" />
            <Picker.Item label="DFCC Bank" value="DFCC Bank" />
          </Picker>
        </View>

        <Text style={styles.label}>Branch Name</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={branchName}
            onValueChange={setBranchName}
            style={styles.picker}
          >
            <Picker.Item label="Please select your branch" value="" />
            <Picker.Item label="Kalmunai Unity Square" value="Kalmunai Unity Square" />
            <Picker.Item label="Colombo Main" value="Colombo Main" />
            <Picker.Item label="Kandy City" value="Kandy City" />
            <Picker.Item label="Galle Fort" value="Galle Fort" />
            <Picker.Item label="Jaffna Central" value="Jaffna Central" />
          </Picker>
        </View>

        <Text style={styles.label}>Bank Account No</Text>
        <TextInput 
          placeholder="Enter your account no" 
          value={accountNumber} 
          onChangeText={setAccountNumber} 
          style={styles.input} 
          keyboardType="numeric"
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