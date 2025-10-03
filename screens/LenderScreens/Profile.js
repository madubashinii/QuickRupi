import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import AnimatedScreen from '../../components/AnimatedScreen';

const Profile = () => {
  return (
    <AnimatedScreen style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Lender Profile Settings</Text>
    </AnimatedScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.deepForestGreen,
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
    color: colors.tiffanyBlue,
  },
});

export default Profile;
