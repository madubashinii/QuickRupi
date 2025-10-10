import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from 'react';
import BorrowerStack from "../navigation/borrower/borrowerStack";
import ChatBot from "../screens/chatbot";


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Borrower" component={BorrowerStack} />
        <Stack.Screen name="ChatBot" component={ChatBot} />
    </Stack.Navigator>
  );
};
