// navigation/AuthStack.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/auth/LoginScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import KycBorrowerStack from "./KycBorrowerStack";
import KycLenderStack from "./KycLenderStack";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
      <Stack.Screen name="KycBorrowerStack" component={KycBorrowerStack} />
      <Stack.Screen name="KycLenderStack" component={KycLenderStack} />
    </Stack.Navigator>
  );
}