import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import InfoBox from "../../components/borrower/infoBox"; 
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const PaymentRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const fixedUserId = "B001";

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const q = query(
          collection(db, "escrow"),
          where("borrowerId", "==", "UtffzX636Jb1wiqNyimTaux88pZ2")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecords(data);
      } catch (error) {
        console.error("Error fetching payment records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#045d56" />
      </View>
    );
  }

  if (records.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noRecordsText}>No payment records found for this user.</Text>
        <View style={styles.buttonsColumn}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("BorrowerPayment")}
          >
            <Ionicons name="add-circle-outline" size={22} color="#000" />
            <Text style={styles.buttonText}>Add Payment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("BorrowerSchedule")}
          >
            <Ionicons name="calendar-outline" size={22} color="#000" />
            <Text style={styles.buttonText}>Payment Schedules</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Stack buttons vertically */}
      <View style={styles.buttonsColumn}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("BorrowerSchedule")}
        >
          <Ionicons name="calendar-outline" size={22} color="#000" />
          <Text style={styles.buttonText}>Payment Schedules</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("BorrowerPayment")}
        >
          <Ionicons name="add-circle-outline" size={22} color="#000" />
          <Text style={styles.buttonText}>Add Payment</Text>
        </TouchableOpacity>
      </View>

      {/* Payment Records */}
      {records.map((record) => (
        <View key={record.id} style={styles.recordCard}>
          <InfoBox
            title="LoanID"
            data={[{ key: "LoanID", value: record.loanid }]}
          />
          <InfoBox
            title="Amount"
            data={[{ key: "Amount", value: record.amount }]}
          />
          <InfoBox
            title="Date"
            data={[{ key: "Date", value: record.paidAt }]}
          />
          <InfoBox
            title="Method"
            data={[{ key: "Method", value: record.method }]}
          />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#e6f8f9" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  noRecordsText: { fontSize: 18, color: "#045d56", marginBottom: 20, textAlign: "center" },
  buttonsColumn: { flexDirection: "column", justifyContent: "flex-start", marginBottom: 15 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4ade80",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: "100%",
  },
  buttonText: { fontSize: 16, fontWeight: "600", color: "#000", marginLeft: 8 },
  recordCard: {
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "100%",
  },
});

export default PaymentRecords;
