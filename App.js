import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import BorrowerDashboard from './screens/borrower/BorrowerDashboard';
import AppNavigator from "./navigation/AppNavigator";
import BorrowerBottomNav from "./navigation/borrower/borrowerNav";
import LenderTabs from './navigation/LenderTabs';
import NotificationsScreen from './screens/LenderScreens/Notifications';
import MessagesScreen from './screens/LenderScreens/MessagesScreen';
import Toast from 'react-native-toast-message';
const Stack = createNativeStackNavigator();


export default function App() {
  return (

    <NavigationContainer>
      <AppNavigator />
      <Toast />
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

