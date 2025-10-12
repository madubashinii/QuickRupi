import React from 'react';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
      <Toast />
      <StatusBar style="light" />
    </AuthProvider>
  );
}
