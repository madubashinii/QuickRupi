import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import { useNavigation } from "@react-navigation/native";

const BorrowingsScreen = () => {
  const [loans, setLoans] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("Active");
  const userId = "B001"; 
  const navigation = useNavigation();

  // Load loans from Firebase
  useEffect(() => {
    const fetchLoans = async () => {
      const snapshot = await getDocs(collection(db, "Loans"));
      const loanList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // filter by userId 
      const userLoans = loanList.filter((loan) => loan.userId === userId);
      setLoans(userLoans);
    };
    fetchLoans();
  }, []);

  // Delete loan record
  const handleDeleteLoan = async (loanId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this pending loan request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "Loans", loanId));
              setLoans((prev) => prev.filter((loan) => loan.id !== loanId));
              Alert.alert("Deleted", "Loan request has been deleted.");
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "Failed to delete loan. Try again.");
            }
          },
        },
      ]
    );
  };

  // Edit loan (placeholder)
  const handleEditLoan = (loan) => {
    // You can navigate to EditLoanScreen or open modal
    // navigation.navigate("EditLoanScreen", { loan })
    Alert.alert("Edit Loan", `Edit feature for loan ID ${loan.id} coming soon!`);
  };

  // Filter loans by selectedStatus
  const filteredLoans = loans.filter((loan) => loan.status === selectedStatus);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#e6f8f9" }}
      contentContainerStyle={styles.container}
    >
      {/* Header */}
      <Text style={styles.header}>Borrowings</Text>

      {/* Status Tabs */}
      <View style={styles.tabContainer}>
        {["Active", "Pending", "Finished"].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.tabButton,
              selectedStatus === status && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text
              style={[
                styles.tabText,
                selectedStatus === status && styles.tabTextActive,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>
          Total {selectedStatus.toLowerCase()} loans : {filteredLoans.length}
        </Text>
      </View>

      {/* Active Loan Actions */}
      {selectedStatus === "Active" && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.payNowButton}
          onPress={() => navigation.navigate("BorrowerLoan")}>
            <Text style={styles.payNowText}>Pay Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.requestButton}
          onPress={() => navigation.navigate("BorrowerRepayment")}>
            <Text style={styles.requestText}>Request Loan</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loan Cards */}
      {filteredLoans.map((loan) => (
        <View key={loan.id} style={styles.loanCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="card-outline" size={20} color="#045d56" />
            <Text style={styles.loanId}>ID-{loan.id.slice(0, 6)}</Text>
          </View>

          <Text style={styles.loanType}>Loan type: {loan.loanPurpose}</Text>
          <Text>Interest rate: {loan.interestRate || "12%"} p.a</Text>
          <Text>Term: {loan.repaymentPeriodMonths} months</Text>
          <Text>Amount: Rs. {loan.loanAmount?.toLocaleString()}</Text>

          <View style={styles.cardButtons}>
            <TouchableOpacity style={styles.detailsBtn}>
              <Text style={styles.detailsText}>Details</Text>
            </TouchableOpacity>

            {selectedStatus === "Active" && (
              <TouchableOpacity style={styles.payBtn}>
                <Text style={styles.payText}>Pay</Text>
              </TouchableOpacity>
            )}

            {selectedStatus === "Pending" && (
              <>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => handleEditLoan(loan)}
                >
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteLoan(loan.id)}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#045d56",
    marginBottom: 15,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#d6f3f4",
    borderRadius: 12,
    padding: 5,
    marginBottom: 15,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: "#64dfdf",
  },
  tabText: {
    color: "#045d56",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  summaryBox: {
    backgroundColor: "#045d56",
    padding: 10,
    borderRadius: 10,
    marginVertical: 8,
  },
  summaryText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 20,
  },
  payNowButton: {
    backgroundColor: "#4ade80",
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 10,
    marginVertical: 6,
  },
  payNowText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  requestButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 10,
  },
  requestText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  loanCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  loanId: {
    marginLeft: 6,
    fontWeight: "bold",
    color: "#045d56",
  },
  loanType: {
    fontWeight: "500",
    marginBottom: 5,
    color: "#023c40",
  },
  cardButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    flexWrap: "wrap",
    gap: 10,
  },
  detailsBtn: {
    backgroundColor: "#e6f8f9",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  detailsText: { color: "#045d56", fontWeight: "bold" },
  payBtn: {
    backgroundColor: "#045d56",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  payText: { color: "#fff", fontWeight: "bold" },
  editBtn: {
    backgroundColor: "#facc15",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  editText: { color: "#fff", fontWeight: "bold" },
  deleteBtn: {
    backgroundColor: "#ef4444",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  deleteText: { color: "#fff", fontWeight: "bold" },
});

export default BorrowingsScreen;
