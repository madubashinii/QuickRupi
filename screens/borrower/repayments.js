import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import InfoText from "../components/InfoBox"; 

const PaymentRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fixedUserId = "B001";// replace with a test user ID

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const q = query(
          collection(db, "repayments"),
          where("userId", "==", fixedUserId) //replace this with correct id after testing
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
        <Text>No payment records found for this user.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
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

export default PaymentRecords;
