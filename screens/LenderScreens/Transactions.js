import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import AnimatedScreen from '../../components/AnimatedScreen';

const Transactions = () => {
  return (
    <AnimatedScreen style={styles.container}>
      <Text style={styles.title}>Transactions</Text>
      <Text style={styles.subtitle}>Transaction History</Text>
    </AnimatedScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.blueGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
  },
});

export default Transactions;
