import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import AnimatedScreen from '../../components/AnimatedScreen';

const Investments = () => {
  return (
    <AnimatedScreen style={styles.container}>
      <Text style={styles.title}>Investments</Text>
      <Text style={styles.subtitle}>Your Investment Portfolio</Text>
    </AnimatedScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.tiffanyBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.midnightBlue,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.forestGreen,
  },
});

export default Investments;
