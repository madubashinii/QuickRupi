import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from "./navigation/AppNavigator";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

