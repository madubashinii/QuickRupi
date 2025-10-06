import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './navigation/AppNavigator';
import LenderTabs from './navigation/LenderTabs';
import NotificationsScreen from './screens/LenderScreens/Notifications';
import MessagesScreen from './screens/LenderScreens/MessagesScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* AppNavigator can handle Admin/User roles */}
        <Stack.Screen name="AppNavigator" component={AppNavigator} />

        {/* Lender-specific screens */}
        <Stack.Screen name="LenderTabs" component={LenderTabs} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Messages" component={MessagesScreen} />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
