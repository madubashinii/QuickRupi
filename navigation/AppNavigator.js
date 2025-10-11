import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from 'react';
import BorrowerStack from "../navigation/borrower/borrowerStack";
import ChatBot from "../screens/chatbot";
import AdminStack from "../navigation/admin/AdminStack";
import LenderTabs from '../navigation/LenderTabs';
import NotificationsScreen from '../screens/LenderScreens/Notifications';
import MessagesScreen from '../screens/LenderScreens/MessagesScreen';
import Toast from 'react-native-toast-message';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Borrower" component={BorrowerStack} />
      <Stack.Screen name="Admin" component={AdminStack} />
      <Stack.Screen name="ChatBot" component={ChatBot} />
      <Stack.Screen name="MainTabs" component={LenderTabs} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Messages" component={MessagesScreen} />
    </Stack.Navigator>
  );
};
