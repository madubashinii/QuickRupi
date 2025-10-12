import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import InfoText from "../../components/borrower/infoBox"; 
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
          collection(db, "escow_borrower"),
          where("userId", "==", fixedUserId)
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
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.buttonsRow}>
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

      {records.map((record) => (
        <View key={record.id} style={styles.recordCard}>
          <InfoText title="LoanID" value={record.loanid} />
          <InfoText title="Amount" value={record.amount} />
          <InfoText title="Date" value={record.paidAt} />
          <InfoText title="Method" value={record.method} />
          {record.matchedMethodId && <InfoText title="Matched Method ID" value={record.matchedMethodId} />}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#e6f8f9" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  noRecordsText: { fontSize: 18, color: "#045d56", marginBottom: 20, textAlign: "center" },
  buttonsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4ade80",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: { fontSize: 16, fontWeight: "600", color: "#000", marginLeft: 6 },
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
  },
});

export default PaymentRecords;
