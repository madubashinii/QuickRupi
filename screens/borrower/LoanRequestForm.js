import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-root-toast";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../services/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const LoanRequestForm = () => {
  const navigation = useNavigation();

  // === State Variables ===
  const [loanAmount, setLoanAmount] = useState("");
  const [loanPurpose, setLoanPurpose] = useState("");
  const [repaymentPeriodMonths, setRepaymentPeriodMonths] = useState("");
  const [notes, setNotes] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [guarantor, setGuarantor] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [existingLoanEMI, setExistingLoanEMI] = useState("");
  const [loanRate, setLoanRate] = useState('');
  // Replace this with logged-in user ID
  const userId = "USER001";

  const submitLoanRequest = async () => {
    if (!loanAmount || !loanPurpose || !repaymentPeriodMonths) {
      Toast.show("Please fill all required fields", { duration: 2000 });
      return;
    }

    try {
      const loanRequest = {
        userId,
        appliedDate: new Date(),
        status: "Pending",
        loanAmount: Number(loanAmount),
        loanPurpose,
        repaymentPeriodMonths: Number(repaymentPeriodMonths),
        rate:Number(loanRate),
        notes: notes || "",
        existingLoanEMI: Number(existingLoanEMI) || 0,
        guarantor: guarantor || "",
        kycSnapshot: businessName ? { businessName } : {},
        bankDetails: {
          bankName: bankName || "",
          accountNumber: bankAccount || "",
        },
        docs: {
          bankStatement: null,
          salarySlip: null,
          businessRegistration: null,
        },
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "loans"), loanRequest);

      Toast.show("Loan request submitted successfully!", { duration: 2000 });

      // Clear form
      setLoanAmount("");
      setLoanPurpose("");
      setRepaymentPeriodMonths("");
      setNotes("");
      setBusinessName("");
      setGuarantor("");
      setBankName("");
      setBankAccount("");
      setExistingLoanEMI("");

      navigation.goBack();
    } catch (error) {
      console.error("Error submitting loan request:", error);
      Toast.show("Failed to submit loan request", { duration: 2000 });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={28} color="#000" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Loan Request Form</Text>

      {/* Loan Amount */}
      <TextInput
        placeholder="Loan Amount (LKR)"
        keyboardType="numeric"
        value={loanAmount}
        onChangeText={setLoanAmount}
        style={styles.input}
      />

      {/* Loan Purpose */}
      <TextInput
        placeholder="Purpose of Loan"
        value={loanPurpose}
        onChangeText={setLoanPurpose}
        style={styles.input}
      />

      {/* Repayment Period */}
      <TextInput
        placeholder="Repayment Period (in months)"
        keyboardType="numeric"
        value={repaymentPeriodMonths}
        onChangeText={setRepaymentPeriodMonths}
        style={styles.input}
      />

      {/* Existing EMI */}
      <TextInput
        placeholder="Existing Loan EMI (if any)"
        keyboardType="numeric"
        value={existingLoanEMI}
        onChangeText={setExistingLoanEMI}
        style={styles.input}
      />

      <TextInput
        placeholder="Loan Rate"
        keyboardType="numeric"
        value={loanRate}
        onChangeText={setLoanRate}
        style={styles.input}
      />

      {/* Business Name / KYC */}
      <TextInput
        placeholder="Business Name (if applicable)"
        value={businessName}
        onChangeText={setBusinessName}
        style={styles.input}
      />

      {/* Guarantor */}
      <TextInput
        placeholder="Guarantor Name (optional)"
        value={guarantor}
        onChangeText={setGuarantor}
        style={styles.input}
      />

      {/* Bank Name */}
      <TextInput
        placeholder="Bank Name"
        value={bankName}
        onChangeText={setBankName}
        style={styles.input}
      />

      {/* Bank Account */}
      <TextInput
        placeholder="Bank Account Number"
        keyboardType="numeric"
        value={bankAccount}
        onChangeText={setBankAccount}
        style={styles.input}
      />

      {/* Notes */}
      <TextInput
        placeholder="Additional Notes (optional)"
        value={notes}
        onChangeText={setNotes}
        style={[styles.input, { height: 80 }]}
        multiline
      />

      <TouchableOpacity style={styles.submitButton} onPress={submitLoanRequest}>
        <Text style={styles.submitText}>Submit Loan Request</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#0C6170",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#0C6170",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  submitText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  backButton: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  backText: { fontSize: 16, marginLeft: 5 },
});

export default LoanRequestForm;
