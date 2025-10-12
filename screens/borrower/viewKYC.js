import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from "react-native";
import Toast from "react-native-root-toast";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../services/firebaseConfig";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

// Custom Confirmation Modal
const ConfirmModal = ({ visible, message, onConfirm, onCancel }) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={modalStyles.overlay}>
      <View style={modalStyles.container}>
        <Text style={modalStyles.message}>{message}</Text>
        <View style={modalStyles.buttons}>
          <TouchableOpacity style={modalStyles.cancelBtn} onPress={onCancel}>
            <Text style={modalStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={modalStyles.confirmBtn} onPress={onConfirm}>
            <Text style={modalStyles.confirmText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: 300,
  },
  message: { fontSize: 16, marginBottom: 20, textAlign: "center" },
  buttons: { flexDirection: "row", justifyContent: "space-between" },
  cancelBtn: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
  },
  confirmBtn: {
    backgroundColor: "#ef4444",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
  },
  cancelText: { color: "#000", textAlign: "center", fontWeight: "bold" },
  confirmText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});

const KYCView = () => {
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigation = useNavigation();
  const userId = "B001";

  useEffect(() => {
    const fetchKYC = async () => {
      try {
        const q = query(collection(db, "kyc"), where("userId", "==", userId));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) setKyc({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
        else setKyc(null);
      } catch (error) {
        console.error("Error fetching KYC:", error);
        Toast.show("Failed to fetch KYC.", { duration: 2000 });
      } finally {
        setLoading(false);
      }
    };

    fetchKYC();
  }, []);

  const handleDeletePress = () => setShowModal(true);

  const handleConfirmDelete = async () => {
    setShowModal(false);
    if (!kyc) return;
    try {
      await deleteDoc(doc(db, "kyc", kyc.id));
      setKyc(null);
      Toast.show("KYC record deleted successfully.", { duration: 2000 });
    } catch (error) {
      console.error(error);
      Toast.show("Failed to delete KYC.", { duration: 2000 });
    }
  };

  const handleEditKYC = () => {
    if (!kyc) return;
    navigation.navigate("BorrowerKYC", { kycData: kyc });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={{ marginTop: 10, color: "#000" }}>Loading KYC...</Text>
      </View>
    );
  }

  if (!kyc) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("BorrowerProfile")}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.noRecordText}>No KYC record found.</Text>

        <TouchableOpacity
          style={[styles.kycButton, { backgroundColor: "#4ade80" }]}
          onPress={() => navigation.navigate("BorrowerKYC")}
        >
          <Text style={styles.kycButtonText}>Submit KYC Form</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("BorrowerProfile")}>
        <Ionicons name="chevron-back" size={28} color="#fff" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>KYC Details</Text>

      {[
        ["Full Name", kyc.fullName],
        ["Business Name", kyc.businessName],
        ["City", kyc.city],
        ["Date of Birth", kyc.dateOfBirth?.toDate?.()?.toLocaleDateString()],
        ["Email", kyc.email],
        ["Phone", kyc.phone],
        ["Occupation", kyc.occupation],
        ["Monthly Income", kyc.monthlyIncome],
        ["KYC Status", kyc.kycStatus],
        ["Submitted At", kyc.submittedAt?.toDate?.()?.toLocaleString()],
      ].map(([label, value], i) => (
        <View key={i} style={{ marginBottom: 8 }}>
          <Text style={styles.label}>{label}:</Text>
          <Text style={styles.value}>{value || "N/A"}</Text>
        </View>
      ))}

      <Text style={styles.label}>ID Front:</Text>
      <Image source={{ uri: kyc.identityProofFront }} style={styles.image} />

      <Text style={styles.label}>ID Back:</Text>
      <Image source={{ uri: kyc.identityProofBack }} style={styles.image} />

      {/* Edit & Delete Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.editBtn, { backgroundColor: "#4ade80" }]} onPress={handleEditKYC}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.deleteBtn, { backgroundColor: "#ef4444" }]} onPress={handleDeletePress}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <ConfirmModal
        visible={showModal}
        message="Are you sure you want to delete your KYC record?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowModal(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#e6f8f9" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#000" },
  label: { fontWeight: "bold", color: "#000" },
  value: { marginBottom: 5, color: "#000" },
  image: { width: "100%", height: 200, marginVertical: 10, borderRadius: 8 },
  noRecordText: { fontSize: 18, color: "#555", marginBottom: 20 },
  kycButton: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8, marginBottom: 10, alignItems: "center" },
  kycButtonText: { color: "#000", fontSize: 16, fontWeight: "600" },
  backButton: { flexDirection: "row", alignItems: "center", marginBottom: 15, backgroundColor: "#4ade80", padding: 8, borderRadius: 8, alignSelf: "flex-start" },
  backButtonText: { fontSize: 16, marginLeft: 5, fontWeight: "600", color: "#000" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  actionRow: { flexDirection: "row", justifyContent: "space-around", marginVertical: 20 },
  editBtn: { padding: 12, borderRadius: 8, minWidth: 100, alignItems: "center" },
  editText: { color: "#000", fontWeight: "bold" },
  deleteBtn: { padding: 12, borderRadius: 8, minWidth: 100, alignItems: "center" },
  deleteText: { color: "#fff", fontWeight: "bold" },
});

export default KYCView;
