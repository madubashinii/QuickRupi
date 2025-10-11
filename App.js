import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import BorrowerDashboard from './screens/borrower/BorrowerDashboard';
//import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigator from "./navigation/AppNavigator";
//const Stack = createNativeStackNavigator();


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
  //
  );
}

