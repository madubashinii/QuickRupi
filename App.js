import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import LenderTabs from './navigation/LenderTabs';

export default function App() {
  return (
    <NavigationContainer>
      <LenderTabs />
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
