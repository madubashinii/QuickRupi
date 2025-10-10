import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PersonalDetailsScreen from '../screens/kycBorrower/PersonalDetailsScreen';
import LoanDetailsScreen from '../screens/kycBorrower/LoanDetailsScreen';
import AccountDetailsScreen from '../screens/kycBorrower/AccountDetailsScreen';

const Stack = createStackNavigator();

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
        name="LoanDetailsScreen" 
        component={LoanDetailsScreen}
        options={{
          title: 'Loan Details',
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