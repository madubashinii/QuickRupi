import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
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

        const loansRef = collection(db, "loans");
        const q = query(loansRef, where("userId", "==", user.uid));
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

            // random dot color for each loan in calendar
            const color = "#" + Math.floor(Math.random() * 16777215).toString(16);

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
    paidEMIs = selectedLoan.schedule.slice(0, 1); // first EMI paid
    remainingEMIs = selectedLoan.schedule.slice(1); // rest remaining
  }


  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate("MainApp")}
        style={styles.btn}
      >
        <Text style={styles.btnText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Loan Payment Schedules</Text>

      <TouchableOpacity
        onPress={() => navigation.navigate("Payment")}
        style={styles.btn}
      >
        <Text style={styles.btnText}>Pay Now</Text>
      </TouchableOpacity>

      {/* Loan Selection */}
      <Text style={styles.sectionTitle}>Select Loan</Text>
      {loans.map((loan) => (
        <TouchableOpacity
          key={loan.loanId}
          style={[
            styles.optionBtn,
            selectedLoanId === loan.loanId && { backgroundColor: "#ddd" },
          ]}
          onPress={() => handleSelectLoan(loan.loanId)}
        >
          <Text style={styles.optionText}>{loan.loanName}</Text>
        </TouchableOpacity>
      ))}

      {selectedLoan ? (
<>
         {/* Summary Info */}

      <Text>Summary</Text>

      {/* Paid Amount */}
      <Text>
        Paid Amount:{" "}
        {paidEMIs.reduce((sum, item) => sum + parseFloat(item.emi), 0).toFixed(2)}
      </Text>

      {/* Remaining Amount */}
      <Text>
        Remaining Amount:{" "}
        {remainingEMIs.reduce((sum, item) => sum + parseFloat(item.emi), 0).toFixed(2)}
      </Text>

      {/* Next EMI */}
      {remainingEMIs.length > 0 ? (
        <Text>
          Next Payment: {remainingEMIs[0].date} - EMI {remainingEMIs[0].emi}
        </Text>
      ) : (
        <Text>Loan fully paid </Text>
      )}

        </>
      ) : (
        <Text>Please select a loan to view schedule.</Text>
      )}

      <Calendar markedDates={markedDates} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, marginTop: 40 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginTop: 16 },
  row: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  btn: {
    borderWidth: 2,
    borderColor: "#533483",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginTop: 6,
  },
  btnText: {
    color: "#533483",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  optionBtn: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    marginTop: 6,
  },
  optionText: {
    fontSize: 16,
  },
});
