import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { db } from "../../services/firebaseConfig"; // adjust path
import { collection, addDoc } from "firebase/firestore";
import Toast from "react-native-root-toast";
import { useNavigation } from "@react-navigation/native";

const LoanRequestForm = () => {
  const [loanAmount, setLoanAmount] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('');
  const [loanRate, setLoanRate] = useState('');
  const navigation = useNavigation();
  const borrowerId = "B001"; // Replace with current user ID
  const interestRate = 12.5; // example fixed value

  const submitLoanRequest = async () => {
    if (!loanAmount || !loanTerm || !loanPurpose) {
      Toast.show("Please fill all fields");
      return;
    }

    try {
      // Generate unique loanId (can use timestamp)
      const loanId = `L${new Date().getTime()}`;

      await addDoc(collection(db, "loans"), {
        amountRequested: Number(loanAmount),
        borrowerId,
        createdAt: new Date(),
        loanRate,
        loanId,
        purpose: loanPurpose,
        status: "Pending",
        termMonths: Number(loanTerm),
      });

      Toast.show("Loan request submitted!", ToastAndroid.SHORT);

      // Reset form
      setLoanAmount('');
      setLoanTerm('');
      setLoanPurpose('');
      setLoanRate('');

      navigation.goBack(); // or navigate to Loans list
    } catch (error) {
      console.error("Error submitting loan request:", error);
      Toast.show("Failed to submit loan request");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={28} color="#000" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Loan Request Form</Text>

      <TextInput
        placeholder="Loan Amount"
        keyboardType="numeric"
        value={loanAmount}
        onChangeText={setLoanAmount}
        style={styles.input}
      />

      <TextInput
        placeholder="Loan Term (in months)"
        keyboardType="numeric"
        value={loanTerm}
        onChangeText={setLoanTerm}
        style={styles.input}
      />

      <TextInput
        placeholder="Loan Rate"
        keyboardType="numeric"
        value={loanTerm}
        onChangeText={setLoanRate}
        style={styles.input}
      />

      <TextInput
        placeholder="Loan Purpose"
        value={loanPurpose}
        onChangeText={setLoanPurpose}
        style={styles.input}
      />

      <TouchableOpacity style={styles.submitButton} onPress={submitLoanRequest}>
        <Text style={styles.submitText}>Submit Request</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginVertical: 10 },
  submitButton: { backgroundColor: "#0C6170", padding: 15, borderRadius: 10, marginTop: 20 },
  submitText: { color: "#fff", textAlign: 'center', fontWeight: 'bold' },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backText: { fontSize: 16, marginLeft: 5 },
});

export default LoanRequestForm;
