// App.js
import './services/firebaseConfig'; 
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './context/AuthContext';


export default function App() {
  return(
        <AuthProvider>
          <NavigationContainer>
            <AppNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </AuthProvider>
        );
}