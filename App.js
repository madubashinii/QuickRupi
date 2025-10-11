import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import BorrowerDashboard from './screens/borrower/BorrowerDashboard';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
      {/*<Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={LenderTabs} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Messages" component={MessagesScreen} />
      </Stack.Navigator>
      <Toast />
      <StatusBar style="light" />*/}
      <AppNavigator />
    </NavigationContainer>

    //<View style={styles.container}>
    // {/*<Text>Open up App.js to start working on your app!</Text>*/}     // <BorrowerDashboard />
    //  <StatusBar style="auto" />
    //</View>
  );
}

