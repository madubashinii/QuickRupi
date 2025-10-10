import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../services/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import Toast from "react-native-root-toast";
import { Ionicons } from "@expo/vector-icons";

const KYCView = () => {
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const userId = "B001"; // current user ID (temporary)

  useEffect(() => {
    const fetchKYC = async () => {
      try {
        const q = query(collection(db, "kyc"), where("user", "==", userId));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setKyc(snapshot.docs[0].data());
        } else {
          setKyc(null);
        }
      } catch (error) {
        console.error("Error fetching KYC:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKYC();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

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
        <Text style={styles.noRecordText}>No KYC record found.</Text>
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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>KYC Details</Text>

      <Text style={styles.label}>Full Name:</Text>
      <Text style={styles.value}>{kyc.fullName}</Text>

      <Text style={styles.label}>Business Name:</Text>
      <Text style={styles.value}>{kyc.businessName}</Text>

      <Text style={styles.label}>City:</Text>
      <Text style={styles.value}>{kyc.city}</Text>

      <Text style={styles.label}>Date of Birth:</Text>
      <Text style={styles.value}>
        {kyc.dateOfBirth?.toDate?.()?.toLocaleDateString()}
      </Text>

      <Text style={styles.label}>Email:</Text>
      <Text style={styles.value}>{kyc.email}</Text>

      <Text style={styles.label}>Phone:</Text>
      <Text style={styles.value}>{kyc.phone}</Text>

      <Text style={styles.label}>Occupation:</Text>
      <Text style={styles.value}>{kyc.occupation}</Text>

      <Text style={styles.label}>Monthly Income:</Text>
      <Text style={styles.value}>{kyc.monthlyIncome}</Text>

      <Text style={styles.label}>KYC Status:</Text>
      <Text style={styles.value}>{kyc.kycStatus}</Text>

      <Text style={styles.label}>Submitted At:</Text>
      <Text style={styles.value}>
        {kyc.submittedAt?.toDate?.()?.toLocaleString()}
      </Text>

      <Text style={styles.label}>ID Front:</Text>
      <Image source={{ uri: kyc.identityProofFront }} style={styles.image} />

      <Text style={styles.label}>ID Back:</Text>
      <Image source={{ uri: kyc.identityProofBack }} style={styles.image} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: { fontWeight: "bold", marginTop: 10 },
  value: { marginBottom: 5 },
  image: { width: "100%", height: 200, marginVertical: 10, borderRadius: 8 },
  noRecordText: { fontSize: 18, color: "#555", marginBottom: 20 },
  kycButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  kycButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default KYCView;
