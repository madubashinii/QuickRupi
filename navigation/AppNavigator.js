import { createStackNavigator } from "@react-navigation/stack";
import React from 'react';
import BorrowerStack from "../navigation/borrower/borrowerStack";


const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Borrower" component={BorrowerStack} />
    </Stack.Navigator>
  );
};
