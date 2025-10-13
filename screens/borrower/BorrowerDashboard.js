import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import InfoBox from '../../components/borrower/infoBox';
import { auth, db } from '../../services/firebaseConfig';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';

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
  //const navigation = useNavigation();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    img: ''
  });
  const navigation = useNavigation();

  useEffect(() => {
    const borrowerId = 'UtffzX636Jb1wiqNyimTaux88pZ2'; // replace with auth.currentUser.uid if needed

    const fetchLoans = async () => {
      try {
        // const user = auth.currentUser;
        // if (!user) return;

        const loansRef = collection(db, "Loans"); 
        const q = query(loansRef, where("borrowerId", "==", borrowerId));
        const querySnapshot = await getDocs(q);

        let completed = 0;
        let pending = 0;

        querySnapshot.forEach((doc) => {
          const loan = doc.data();
          if (loan.status === "Completed") completed++;
          else if (loan.status === "Pending"|| loan.status==="pending") pending++;
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
    //user@gmail.com is printed
    const fetchUserData = async () => {
      try {
        const userRef = doc(db, "Users", borrowerId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData({
            name: userSnap.data().name,
            email: userSnap.data().email,
            img: userSnap.data().img || ''
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchLoans();
    fetchUserData();
  }, []);

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.heading}>Welcome to the Borrower Dashboard</Text>

        {/* User Details Box */}
        <LinearGradient 
          colors={['#045d56', '#4ade80']} 
          style={styles.userBox}
        >
          {userData.img ? (
            <Image source={{ uri: userData.img }} style={styles.userImg} />
          ) : (
            <Ionicons name="person-circle-outline" size={60} color="#fff" />
          )}
          <View style={{ marginLeft: 15 }}>
            <Text style={styles.userName}>{userData.name || 'User Name'}</Text>
            <Text style={styles.userEmail}>{userData.email || 'user@example.com'}</Text>
          </View>
        </LinearGradient>

        {/* Loan Summary */}
        <InfoBox title="Loan Summary" data={loanDetails} />

        {/* Example Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button}
          onPress={() => navigation.navigate("BorrowerLoanForm")}>
            <Text style={styles.buttonText}>Request Loan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}
          onPress={() => navigation.navigate("BorrowerNotifications")}>
            <Text style={styles.buttonText}>Notifications</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flex: 1, backgroundColor: '#e6f8f9' },
  container: { flex: 1, padding: 20, alignItems: 'center' },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  userBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  userImg: { width: 60, height: 60, borderRadius: 30 },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  userEmail: { fontSize: 14, color: '#e0f7f7' },
  buttonContainer: { flexDirection: 'row', marginTop: 20, justifyContent: 'space-between', width: '100%' },
  button: {
    flex: 1,
    backgroundColor: '#4ade80',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});

export default BorrowerDashboard;
