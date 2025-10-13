import React, { useEffect, useState } from "react";
import { 
  View, Text, TextInput, Image, TouchableOpacity, StyleSheet, ScrollView, Modal 
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-root-toast";
import { db } from "../../services/firebaseConfig";
import { 
  collection, addDoc, getDocs, doc, setDoc, updateDoc, increment, query, where 
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Calendar } from "react-native-calendars";

const PaymentForm = () => {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [image, setImage] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loanModalVisible, setLoanModalVisible] = useState(false);
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);

  const navigation = useNavigation();
  const fixedUserId = "UtffzX636Jb1wiqNyimTaux88pZ2"; // example userId

  // Fetch payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const q = query(collection(db, "paymentMethods"));
        const snapshot = await getDocs(q);
        const methods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPaymentMethods(methods);
      } catch (error) {
        console.error("Error fetching payment methods:", error);
        Toast.show("Failed to load payment methods", { duration: Toast.durations.LONG });
      }
    };

    fetchPaymentMethods();
  }, []);

  // Fetch user loans
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const q = query(collection(db, "Loans"), where("borrowerId", "==", fixedUserId));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLoans(data);
      } catch (error) {
        console.error("Error fetching loans:", error);
      }
    };

    fetchLoans();
  }, []);

  // Pick image from gallery
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Toast.show("Gallery access is required", { duration: Toast.durations.LONG });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Save payment
  const savePayment = async () => {
    if (!selectedLoan || !selectedDate || !paymentAmount || !paymentMethod) {
      Toast.show("Please fill all required fields.", { duration: Toast.durations.LONG });
      return;
    }

    try {
      await addDoc(collection(db, "escrow"), {
        repaymentAmount: Number(paymentAmount),
        borrowerId: fixedUserId,
        loanId: selectedLoan.id,
        type: "repayment",
        status: "repayment_pending",
        createdAt: new Date(),
        lastUpdated: new Date(),
        releasedAt: null,
        method: paymentMethod,
        imageUri: image,
        paymentDate: selectedDate,
      });

      Toast.show("Payment saved successfully!", { duration: Toast.durations.SHORT });

      // Reset form
      setPaymentAmount("");
      setPaymentMethod("");
      setImage(null);
      setSelectedLoan(null);
      setSelectedDate(new Date().toISOString().split("T")[0]);
    } catch (error) {
      console.error("Error saving payment:", error);
      Toast.show("Failed to save payment", { duration: Toast.durations.LONG });
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("BorrowerRepayment")}
      >
        <Ionicons name="card" size={24} color="#fff" />
        <Text style={styles.backButtonText}>Repayment History</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Payment Form</Text>

      {/* Loan Selection Modal */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setLoanModalVisible(true)}
      >
        <Text style={styles.buttonText}>
          {selectedLoan ? selectedLoan.LoanName || selectedLoan.id : "Select Loan"}
        </Text>
      </TouchableOpacity>

      <Modal visible={loanModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select Loan</Text>
          <ScrollView>
            {loans.map(loan => (
              <TouchableOpacity
                key={loan.id}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedLoan(loan);
                  setLoanModalVisible(false);
                }}
              >
                <Text>{loan.LoanName || `Loan ${loan.id.slice(0, 6)}`}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeModalBtn}
            onPress={() => setLoanModalVisible(false)}
          >
            <Text style={{ color: "#fff" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Payment Amount */}
      <TextInput
        placeholder="Payment Amount"
        keyboardType="numeric"
        value={paymentAmount}
        onChangeText={setPaymentAmount}
        style={styles.input}
      />

      {/* Payment Date */}
      <Text style={{ marginTop: 10, marginBottom: 5, color: "#045d56", fontWeight: "600" }}>
        Select Payment Date
      </Text>
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={selectedDate ? { [selectedDate]: { selected: true, selectedColor: "#4ade80" } } : {}}
      />
      {selectedDate && <Text>Selected Date: {selectedDate}</Text>}

      {/* Payment Method */}
      <TextInput
        placeholder="Payment Method"
        value={paymentMethod}
        onChangeText={setPaymentMethod}
        style={styles.input}
      />
      {paymentMethod.length > 0 && (
        <Text style={styles.helperText}>
          {paymentMethods.some(m => m.type.toLowerCase() === paymentMethod.toLowerCase())
            ? "Matched existing method"
            : "New/other method"}
        </Text>
      )}

      {/* Image Picker */}
      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.imageButtonText}>Pick an image from gallery</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.image} />}

      {/* Save Button */}
      <TouchableOpacity style={styles.submitButton} onPress={savePayment}>
        <Text style={styles.submitButtonText}>Save Payment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#e6f8f9" },
  container: { padding: 20, alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", color: "#045d56", marginBottom: 20 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    backgroundColor: "#fff",
  },
  //image: { width: 200, height: 200, marginTop: 10, borderRadius: 10 },
  helperText: { fontSize: 12, color: "#555", marginBottom: 5 },
  image: { width: "100%", height: 200, marginVertical: 10, borderRadius: 12 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4ade80",
    padding: 8,
    borderRadius: 8,
    marginBottom: 15,
    alignSelf: "flex-start",
  },
  backButtonText: { fontSize: 16, marginLeft: 5, fontWeight: "600", color: "#000" },
  imageButton: {
    backgroundColor: "#4ade80",
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: "center",
    width: "100%",
  },
  imageButtonText: { color: "#000", fontSize: 16, fontWeight: "600" },
  submitButton: {
    backgroundColor: "#4ade80",
    padding: 14,
    borderRadius: 12,
    marginVertical: 20,
    width: "100%",
    alignItems: "center",
  },
  submitButtonText: { color: "#000", fontSize: 18, fontWeight: "700" },
  button: {
    width: "100%",
    backgroundColor: "#4ade80",
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
    alignItems: "center",
  },
  buttonText: { color: "#000", fontWeight: "600", fontSize: 16 },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#045d56" },
  modalItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  closeModalBtn: {
    backgroundColor: "#ef4444",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
});

export default PaymentForm;
