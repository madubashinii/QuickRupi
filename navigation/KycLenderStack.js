import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PersonalDetails from '../screens/kycLender/PersonalDetails1';
import ContactDetails from '../screens/kycLender/ContactDetails';
import EmploymentDetails from '../screens/kycLender/EmploymentInfo';
import BankDetails from '../screens/kycLender/BankDetails';
import Documents from '../screens/kycLender/Documents';
import AccountInformation from '../screens/kycLender/AccountInformation';

const Stack = createStackNavigator();

export default function KycLenderStack() {
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
        name="PersonalDetails" 
        component={PersonalDetails}
        options={{
          title: 'Personal Details',
          headerShown: false, // We're using custom header in the component
        }}
      />
      <Stack.Screen 
        name="ContactDetails" 
        component={ContactDetails}
        options={{
          title: 'Contact Details',
          headerShown: false, // We're using custom header in the component
        }}
      />
      <Stack.Screen 
        name="EmploymentDetails" 
        component={EmploymentDetails}
        options={{
          title: 'Employment Details',
          headerShown: false, // We're using custom header in the component
        }}
      />
      <Stack.Screen 
        name="BankDetails" 
        component={BankDetails}
        options={{
          title: 'Bank Details',
          headerShown: false, // We're using custom header in the component
        }}
      />
      <Stack.Screen 
        name="Documents" 
        component={Documents}
        options={{
          title: 'Documents',
          headerShown: false, // We're using custom header in the component
        }}
      />
      <Stack.Screen 
        name="AccountInformation" 
        component={AccountInformation}
        options={{
          title: 'Account Information',
          headerShown: false, // We're using custom header in the component
        }}
      />
    </Stack.Navigator>
  );
}