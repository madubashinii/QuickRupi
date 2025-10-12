import React from 'react';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PersonalDetailsScreen from '../screens/kycBorrower/PersonalDetailsScreen';
import AccountDetailsScreen from '../screens/kycBorrower/AccountDetailsScreen';

const Stack = createNativeStackNavigator();

export default function KycBorrowerStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6D28D9',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false,
        cardStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen
        name="PersonalDetailsScreen"
        component={PersonalDetailsScreen}
        options={{
          title: 'Personal Details',
          headerShown: false, // We're using custom header in the component
        }}
      />

      <Stack.Screen
        name="AccountDetailsScreen"
        component={AccountDetailsScreen}
        options={{
          title: 'Account Information',
          headerShown: false, // We're using custom header in the component
        }}
      />
    </Stack.Navigator>
  );
}