import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import InfoBox from '../../components/borrower/infoBox';
import { auth, db } from '../../services/firebaseConfig';
import {doc, getDocs, collection, query, where,} from 'firebase/firestore';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const BorrowerDashboard = () => {

  //const loanDetails = [
   // { key: 'Total Loans', value: 5 },
   // { key: 'Completed Loans', value: 2 },
   // { key: 'Pending Loans', value: 3 },
  //];
  const [loanDetails, setLoanDetails] = useState([]);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userImg, setUserImg] = useState('');
  const [totalLoans, setTotalLoans] = useState(0);
  const [completedLoans, setCompletedLoans] = useState(0);
  const [pendingLoans, setPendingLoans] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    const userType = 'borrower';

     const fetchLoans = async () => {
      try {
        // const user = auth.currentUser;
        // if (!user) return;

        const loansRef = collection(db, "Loans"); 
        const q = query(loansRef, where("borrowerId", "==", "B001"));
        const querySnapshot = await getDocs(q);

        let completed = 0;
        let pending = 0;

        querySnapshot.forEach((doc) => {
          const loan = doc.data();
          if (loan.status === "Completed") completed++;
          else if (loan.status === "Pending") pending++;
        });

        const total = querySnapshot.size;

        // update all states
        setTotalLoans(total);
        setCompletedLoans(completed);
        setPendingLoans(pending);

        // prepare array 
        setLoanDetails([
          { key: 'Total Loans', value: total },
          { key: 'Completed Loans', value: completed },
          { key: 'Pending Loans', value: pending },
        ]);
      } catch (error) {
        console.error("Error fetching loans:", error);
      }
    };

    fetchLoans();
  }, []);

  return (
    <View style={styles.container}> 
      <Text style={styles.text}>Welcome to the Borrower Dashboard</Text>
      <Text>Hello</Text>
      {/*<InfoBox title="Active Loans" value={5} />*/}
      <InfoBox title="Loan Summary" data={loanDetails} />

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, fontWeight: 'bold' },
});

export default BorrowerDashboard;
