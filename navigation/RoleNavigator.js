// Handles navigation after the user logs in, based on their assigned role.
// - If the role is "admin" → loads AdminBottomNav (admin dashboard).
// - If the role is "lender" → loads LenderNavigator (lender dashboard).
// - Includes a loading indicator while the role data is being initialized.


import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminBottomNav from "./admin/AdminBottomNav";
import LenderNavigator from "./lender/LenderNavigator";
import { useRole } from "../context/RoleContext";
import { View, ActivityIndicator } from "react-native";

const Stack = createNativeStackNavigator();

export default function RoleNavigator() {
    const { role, isLoading } = useRole();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#0C6170" />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {role === "admin" ? (
                <Stack.Screen name="AdminFlow" component={AdminBottomNav} />
            ) : role === "lender" ? (
                <Stack.Screen name="LenderFlow" component={LenderNavigator} />
            ) : (
                <Stack.Screen name="LenderFlow" component={LenderNavigator} />
            )}
        </Stack.Navigator>
    );
}
