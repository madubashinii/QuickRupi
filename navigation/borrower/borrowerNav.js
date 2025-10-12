import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import BorrowerDashboard from "../../screens/borrower/BorrowerDashboard";
import PaymentForm from "../../screens/borrower/repayments";
import Loans from "../../screens/borrower/Loans";
import Profile from "../../screens/borrower/profile";

const Tab = createBottomTabNavigator();

export default function BorrowerBottomNav() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#999",
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={BorrowerDashboard}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Payment"
        component={PaymentForm}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="card" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Loans"
        component={Loans}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline"  size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
