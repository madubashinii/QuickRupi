import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { MaterialCommunityIcons } from '@expo/vector-icons';

import AdminDashboard from "../../screens/admin/AdminDashboardScreen";
import RepaymentMonitoring from "../../screens/admin/RepaymentMonitoringScreen";
import DashboardStack from "./DashboardStack";
import EscrowApprovalScreen from "../../screens/admin/EscrowApprovalScreen";
import AnalyticsScreen from "../../screens/admin/AnalyticsScreen";
import AdminProfileScreen from "../../screens/admin/AdminProfileScreen"
import LoanManagementScreen from "../../screens/admin/LoanManagementScreen";

const Tab = createBottomTabNavigator();

export default function AdminBottomNav() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ color, size }) => {
                    if (route.name === "Dashboard") return <Ionicons name="grid-outline" size={size} color={color} />;
                    if (route.name === "Escrow") return <FontAwesome5 name="shield-alt" size={size} color={color} />;
                    if (route.name === "Loans")
                        return <MaterialCommunityIcons name="bank-outline" size={size} color={color} />;
                    if (route.name === "Analytics") return <Ionicons name="bar-chart-outline" size={size} color={color} />;
                    if (route.name === "Profile")
                        return <MaterialCommunityIcons name="account-circle-outline" size={size} color={color} />;
                },
                tabBarActiveTintColor: "#0C6170",
                tabBarInactiveTintColor: "#5a6163ff",
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardStack} />
            <Tab.Screen name="Escrow" component={EscrowApprovalScreen} />
            <Tab.Screen name="Loans" component={LoanManagementScreen} />
            <Tab.Screen name="Analytics" component={AnalyticsScreen} />
            <Tab.Screen name="Profile" component={AdminProfileScreen} />
        </Tab.Navigator>
    );
}
