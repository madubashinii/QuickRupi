import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator,TouchableOpacity } from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import InfoText from "../../components/borrower/infoBox"; // adjust path if needed
import { useNavigation } from "@react-navigation/native";

const LoanRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const fixedUserId = "B001"; // replace with a test user ID

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const q = query(
          collection(db, "loans"),
          where("userId", "==", fixedUserId) // replace later
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
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (records.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No loan records found for this user.</Text>
        <TouchableOpacity
           style={styles.kycButton}
           onPress={() => navigation.navigate("BorrowerLoanForm")}
        >
          <Ionicons name="chevron-back" size={28} color="#000" />
          <Text style={styles.kycButtonText}>New Loan Request</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
           style={styles.kycButton}
           onPress={() => navigation.navigate("BorrowerLoanForm")}
        >
          <Ionicons name="chevron-back" size={28} color="#000" />
          <Text style={styles.kycButtonText}>New Loan Request</Text>
        </TouchableOpacity>
      {records.map((record) => (
        <View key={record.id} style={styles.recordCard}>
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
  container: { flex: 1, padding: 20 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  recordCard: {
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
});

export default LoanRecords;
