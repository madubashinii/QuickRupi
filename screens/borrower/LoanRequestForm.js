import React, { useEffect,useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
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
  const [kyc, setKyc] = useState(null);
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [existingLoanEMI, setExistingLoanEMI] = useState("");
  const [loanRate, setLoanRate] = useState("");

  // temporary user
  const userId = "B001";

   useEffect(() => {
      const fetchKyc = async () => {
    try {
      const q = query(
        collection(db, "borrower_kyc"),
        where("userId", "==", userId)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setKyc(snapshot.docs[0].data()); // set the first KYC record
      } else {
        setKyc(null); // no KYC record
      }
    } catch (error) {
      console.error("Error fetching KYC:", error);
      setKyc(null);
    }
  };
  fetchKyc();
    }, []);

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
        rate: Number(loanRate),
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

      // Clear fields
      setLoanAmount("");
      setLoanPurpose("");
      setRepaymentPeriodMonths("");
      setNotes("");
      setBusinessName("");
      setGuarantor("");
      setBankName("");
      setBankAccount("");
      setExistingLoanEMI("");
      setLoanRate("");

      navigation.goBack();
    } catch (error) {
      console.error("Error submitting loan request:", error);
      Toast.show("Failed to submit loan request", { duration: 2000 });
    }
  };

  if (!kyc) {
      return (
        <View style={styles.container}>
          <TouchableOpacity
             style={styles.kycButton}
             onPress={() => navigation.navigate("BorrowerProfile")}
          >
            <Ionicons name="chevron-back" size={28} color="#000" />
            <Text style={styles.kycButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.noRecordText}>No KYC record found. 
            You have to submit kyc first to apply for a loan.
          </Text>
          <TouchableOpacity
            style={styles.kycButton}
            onPress={() => navigation.navigate("BorrowerKYC")}
          >
            <Text style={styles.kycButtonText}>Submit KYC Form</Text>
          </TouchableOpacity>
        </View>
      );
    }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={26} color="#045d56" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Loan Request Form</Text>

      {/* Inputs */}
      <TextInput
        placeholder="Loan Amount (LKR)"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={loanAmount}
        onChangeText={setLoanAmount}
        style={styles.input}
      />

      {/* Loan Purpose */}
      <TextInput
        placeholder="Purpose of Loan"
        placeholderTextColor="#999"
        value={loanPurpose}
        onChangeText={setLoanPurpose}
        style={styles.input}
      />

      {/* Repayment Period */}
      <TextInput
        placeholder="Repayment Period (in months)"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={repaymentPeriodMonths}
        onChangeText={setRepaymentPeriodMonths}
        style={styles.input}
      />

      {/* Existing EMI */}
      <TextInput
        placeholder="Existing Loan EMI (if any)"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={existingLoanEMI}
        onChangeText={setExistingLoanEMI}
        style={styles.input}
      />

      <TextInput
        placeholder="Loan Rate"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={loanRate}
        onChangeText={setLoanRate}
        style={styles.input}
      />

      {/* Business Name / KYC */}
      <TextInput
        placeholder="Business Name (if applicable)"
        placeholderTextColor="#999"
        value={businessName}
        onChangeText={setBusinessName}
        style={styles.input}
      />

      {/* Guarantor */}
      <TextInput
        placeholder="Guarantor Name (optional)"
        placeholderTextColor="#999"
        value={guarantor}
        onChangeText={setGuarantor}
        style={styles.input}
      />

      {/* Bank Name */}
      <TextInput
        placeholder="Bank Name"
        placeholderTextColor="#999"
        value={bankName}
        onChangeText={setBankName}
        style={styles.input}
      />

      {/* Bank Account */}
      <TextInput
        placeholder="Bank Account Number"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={bankAccount}
        onChangeText={setBankAccount}
        style={styles.input}
      />

      {/* Notes */}
      <TextInput
        placeholder="Additional Notes (optional)"
        placeholderTextColor="#999"
        value={notes}
        onChangeText={setNotes}
        style={[styles.input, { height: 80 }]}
        multiline
      />

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={submitLoanRequest}>
        <Text style={styles.submitText}>Submit Loan Request</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#e6f8f9",
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#045d56",
    textAlign: "center",
    marginVertical: 20,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    fontSize: 16,
    color: "#000", // Ensures text is visible
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: "#4ade80",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3,
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backText: {
    fontSize: 16,
    color: "#045d56",
    marginLeft: 5,
    fontWeight: "500",
  },
});

export default LoanRequestForm;
