import { use, useEffect, useState } from 'react';
import react from react;
import { View, Text, StyleSheet } from 'react-native';

const BorrowerDashboard = () => {

    useEffect(() => {
        const userType = 'borrower';
        const [userName, setUserName] = useState('');
        const [userEmail, setUserEmail] = useState('');
        const [userImg, setUserImg] = useState('');
        const fetchData = async () => {
          try {
            const response = await fetch('https://your-api-endpoint.com/api/user-type', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userType }),
            });
            const data = await response.json();
            console.log(data);
          } catch (error) {
            console.error('Error fetching user type:', error);
          }
        };

        fetchData();
    }, []);
  return (
    <View style={styles.container}> 
      <Text style={styles.text}>Welcome to the Borrower Dashboard</Text>
      {/* <Image source={require('../../assets/')} style={{width: 200, height: 200, marginTop: 20}} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BorrowerDashboard;