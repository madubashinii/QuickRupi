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

import KycBorrowerStack from "./KycBorrowerStack";
import KycLenderStack from "./KycLenderStack";

import { auth } from "../services/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AppNavigator: Setting up auth listener");

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        console.log("Auth state changed:", currentUser ? "User exists" : "No user");
        setUser(currentUser);

        if (currentUser) {
          try {
            // Fetch user role from Firestore (optional)
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setRole(userData.role || "borrower"); // Default to borrower
              console.log("Fetched user role:", userData.role);
            } else {
              console.log("No user document found — defaulting to borrower");
              setRole("borrower");
            }
          } catch (err) {
            console.error("Error fetching user role:", err);
            setRole("borrower");
          }
        }

        setLoading(false);
      },
      (error) => {
        console.error("AppNavigator - Auth error:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#004B46" />
      </View>
    );
  }

  console.log("Rendering navigator - user:", user ? "exists" : "null", "role:", role);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="SplashScreen" component={SplashScreen} />
            <Stack.Screen name="Onboarding1" component={Onboarding1} />
            <Stack.Screen name="Onboarding2" component={Onboarding2} />
            <Stack.Screen name="Onboarding3" component={Onboarding3} />
            <Stack.Screen name="AuthStack" component={AuthStack} />
          </>
        ) : role === "lender" ? (
          <Stack.Screen name="KycLenderStack" component={KycLenderStack} />
        ) : (
          <Stack.Screen name="KycBorrowerStack" component={KycBorrowerStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
