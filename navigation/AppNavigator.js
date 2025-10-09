import { createStackNavigator } from "@react-navigation/stack";
import React from 'react';


const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>

    </Stack.Navigator>
  );
};