import { use, useEffect, useState } from 'react';
import react from react;
import { View, Text, StyleSheet, TextInput } from 'react-native';

const LoanRequestForm = () => {

    useEffect(() => {
        const loanAmount = 0;
        const loanTerm = 0;
        const [loanPurpose, setLoanPurpose] = useState('');
        const fetchData = async () => {
          try {
            const response = await fetch('https://your-api-endpoint.com/api/loan-request');
            }catch (error) {
            console.error('Error fetching loan request data:', error);
          }
           
        };

        fetchData();
    }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Loan Request Form</Text>
      <TextInput
        placeholder="Loan Amount"
        keyboardType="numeric"
        value={loanAmount}
        onChangeText={setLoanAmount}
        style={styles.input}
      />
      <TextInput
        placeholder="Loan Term (in months)"
        keyboardType="numeric"
        value={loanTerm}
        onChangeText={setLoanTerm}
        style={styles.input}
      />
      <TextInput
        placeholder="Loan Purpose"
        value={loanPurpose}
        onChangeText={setLoanPurpose}
        style={styles.input}
      />
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

export default LoanRequestForm;