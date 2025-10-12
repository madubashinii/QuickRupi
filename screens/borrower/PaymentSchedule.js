import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from "react-native";
import { Calendar } from "react-native-calendars";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../services/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// EMI calculation
const calc_EMI = (rate, loanAmount, tenure) => {
  return (
    (loanAmount * rate * Math.pow(1 + rate, tenure)) /
    (Math.pow(1 + rate, tenure) - 1)
  );
};

/* Generate loan calculations for one record
const Payments= (loanAmount, rate, tenure, startDate) => {
  const payment = [];
  let remaining = loanAmount;
  let currentDate = new Date(startDate);
  const interest = remaining * rate;
  const emi = calc_EMI(rate, loanAmount, tenure);
  const principal = emi - interest;
  remaining -= principal;

   payment.push({
      date: currentDate.toISOString().split("T")[0],
      emi: emi.toFixed(2),
      principal: principal.toFixed(2),
      interest: interest.toFixed(2),
      remaining: remaining.toFixed(2),
    });

    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  

  return payment;
};*/

const generateSchedule = (loanAmount, rate, tenure, startDate) => {
  const schedule = [];
  let remaining = loanAmount;
  let currentDate = new Date(startDate);

  for (let i = 0; i < tenure; i++) {
    const interest = remaining * rate;
    const emi = calc_EMI(rate, loanAmount, tenure);
    const principal = emi - interest;
    remaining -= principal;

    schedule.push({
      date: currentDate.toISOString().split("T")[0],
      emi: emi.toFixed(2),
      principal: principal.toFixed(2),
      interest: interest.toFixed(2),
      remaining: remaining > 0 ? remaining.toFixed(2) : "0.00",
    });

    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return schedule;
};

export default function PaymentSchedule() {
  const [loans, setLoans] = useState([]);
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const navigation = useNavigation();

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const loansRef = collection(db, "Loans");
        const q = query(loansRef, where("userId", "==", "B001"));
        const querySnapshot = await getDocs(q);

        const schedules = [];
        const marks = {};

        querySnapshot.forEach((docSnap) => {
          const loan = docSnap.data();

          if (loan.userId === user.uid && loan.Remaining > 0) {
            const tenure = loan.tenure || 12;
            const startDate = loan.StartDate?.toDate?.() || new Date();
            const schedule = generateSchedule(
              loan.loanAmount,
              loan.interest,
              tenure,
              startDate
            );

            const color =
              "#" + Math.floor(Math.random() * 16777215).toString(16);

            schedule.forEach((item) => {
              marks[item.date] = { marked: true, dotColor: color };
            });

            schedules.push({
              loanId: docSnap.id,
              loanName: loan.LoanName || `Loan ${schedules.length + 1}`,
              schedule,
              color,
            });
          }
        });

        setLoans(schedules);
        setMarkedDates(marks);
      } catch (err) {
        console.log("Error fetching loans:", err);
      }
    };

    fetchLoans();
  }, []);

  const handleSelectLoan = (loanId) => {
    setSelectedLoanId(loanId);
    const loan = loans.find((l) => l.loanId === loanId);
    if (loan) {
      const marks = {};
      loan.schedule.forEach((item) => {
        marks[item.date] = { marked: true, dotColor: "#FF0000" };
      });
      setMarkedDates(marks);
    } else {
      setMarkedDates({});
    }
  };

  const today = new Date();
  const selectedLoan = loans.find((l) => l.loanId === selectedLoanId);

  let paidEMIs = [];
  let remainingEMIs = [];
  if (selectedLoan) {
    paidEMIs = selectedLoan.schedule.slice(0, 1);
    remainingEMIs = selectedLoan.schedule.slice(1);
  }


  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Back & Pay Buttons */}
        <TouchableOpacity
          onPress={() => navigation.navigate("BorrowerRepayment")}
          style={styles.btn}
        >
          <Text style={styles.btnText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Loan Payment Schedules</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("BorrowerPayment")}
          style={styles.payBtn}
        >
          <Text style={styles.payBtnText}>Pay Now</Text>
        </TouchableOpacity>

        {/* Loan Selection */}
        <Text style={styles.sectionTitle}>Select Loan</Text>
        {loans.map((loan) => (
          <TouchableOpacity
            key={loan.loanId}
            style={[
              styles.optionBtn,
              selectedLoanId === loan.loanId && { backgroundColor: "#d6f3f4" },
            ]}
            onPress={() => handleSelectLoan(loan.loanId)}
          >
            <Text style={styles.optionText}>{loan.loanName}</Text>
          </TouchableOpacity>
        ))}

        {/* Loan Details */}
         <View>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.selectBtn}>
        <Text style={styles.selectText}>Select Loan</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <FlatList
            data={loans}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.loanItem}
                onPress={() => {
                  onSelect(item);
                  setModalVisible(false);
                }}
              >
                <Text>{item.LoanName || `Loan ${item.id.slice(0,6)}`}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
            <Text style={{ color: "#fff" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
        <View style={styles.whiteCard}>
          {selectedLoan ? (
            <>
              <Text style={styles.subTitle}>Summary</Text>
              <Text>
                Paid Amount:{" "}
                {paidEMIs
                  .reduce((sum, item) => sum + parseFloat(item.emi), 0)
                  .toFixed(2)}
              </Text>

              <Text>
                Remaining Amount:{" "}
                {remainingEMIs
                  .reduce((sum, item) => sum + parseFloat(item.emi), 0)
                  .toFixed(2)}
              </Text>

              {remainingEMIs.length > 0 ? (
                <Text>
                  Next Payment: {remainingEMIs[0].date} - EMI {remainingEMIs[0].emi}
                </Text>
              ) : (
                <Text>Loan fully paid</Text>
              )}
            </>
          ) : (
            <Text>Please select a loan to view schedule.</Text>
          )}
        </View>

        {/* Calendar */}
        <View style={styles.whiteCard}>
          <Calendar markedDates={markedDates} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#e6f8f9", // full-screen mint background
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#045d56",
    marginVertical: 10,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
    color: "#045d56",
  },
  btn: {
    backgroundColor: "#4ade80", // green
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  payBtn: {
    backgroundColor: "#4ade80",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  payBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  optionBtn: {
    backgroundColor: "#fff",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    color: "#045d56",
  },
  whiteCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3,
  },
  subTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 6,
    color: "#045d56",
  },
});
