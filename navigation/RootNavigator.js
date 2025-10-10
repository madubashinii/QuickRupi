// The top-level navigator that decides which main flow to show:
// - If not authenticated → shows AppNavigator (login flow).
// - If authenticated → shows RoleNavigator (role-based flow).
// Also shows a loading indicator while checking authentication status.


import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useRole } from "../context/RoleContext";
import { View, ActivityIndicator } from "react-native";
import AppNavigator from "./AuthNavigator";
import RoleNavigator from "./RoleNavigator";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    const { isAuthenticated, isLoading } = useRole();
    const [showSplash, setShowSplash] = useState(false);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#0C6170" />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
                <Stack.Screen name="Auth" component={AppNavigator} />
            ) : (
                <Stack.Screen name="Main" component={RoleNavigator} />
            )}
        </Stack.Navigator>
    );
}
