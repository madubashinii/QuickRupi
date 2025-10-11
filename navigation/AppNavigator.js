// navigation/AppNavigator.js
import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View, ActivityIndicator } from "react-native";

import SplashScreen from "../screens/SplashScreen";
import Onboarding1 from "../screens/onboarding/Onboarding1";
import Onboarding2 from "../screens/onboarding/Onboarding2";
import Onboarding3 from "../screens/onboarding/Onboarding3";
import AuthStack from "./AuthStack";

import DocumentVerificationScreen from '../screens/common/DocumentVerificationScreen';
import ReputationDashboard from '../screens/reputation/ReputationDashboard';

import KycBorrowerStack from "./KycBorrowerStack";
import KycLenderStack from "./KycLenderStack";
import Dashboard from "../screens/Dashboard"; // Lender Dashboard
import BorrowerDashboard from "../screens/BorrowerDashboard"; // Borrower Dashboard

import { useAuth } from "../context/AuthContext";
import { getLenderDoc, getBorrowerDoc } from "../services/firestoreService"; 

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, userData, loading } = useAuth(); 

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#004B46" />
      </View>
    );
  }

  console.log("Rendering navigator - user:", user ? "exists" : "null", "userData:", userData);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // User is NOT logged in - show auth flow
          <>
            <Stack.Screen name="SplashScreen" component={SplashScreen} />
            <Stack.Screen name="Onboarding1" component={Onboarding1} />
            <Stack.Screen name="Onboarding2" component={Onboarding2} />
            <Stack.Screen name="Onboarding3" component={Onboarding3} />
            <Stack.Screen name="AuthStack" component={AuthStack} />
            <Stack.Screen name="DocumentVerification" component={DocumentVerificationScreen} />
            <Stack.Screen name="ReputationDashboard" component={ReputationDashboard} />
          </>
          
        ) : userData?.kycCompleted ? (
          // User is logged in AND KYC completed - show appropriate dashboard based on userType
          userData?.userType === "lender" ? (
            <Stack.Screen name="Dashboard" component={Dashboard} />
          ) : (
            <Stack.Screen name="BorrowerDashboard" component={BorrowerDashboard} />
          )
        ) : userData?.userType === "lender" ? (
          // User is lender and KYC not completed - continue lender KYC
          <Stack.Screen name="KycLenderStack" component={KycLenderStack} />
        ) : (
          // User is borrower and KYC not completed - continue borrower KYC
          <Stack.Screen name="KycBorrowerStack" component={KycBorrowerStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}