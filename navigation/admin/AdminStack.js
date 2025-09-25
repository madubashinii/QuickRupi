import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminBottomNav from "./AdminBottomNav";
import UsersManagementScreen from "../../screens/admin/UsersManagementScreen";
import EscrowApprovalScreen from "../../screens/admin/EscrowApprovalScreen";
import AnalyticsScreen from "../../screens/admin/AnalyticsScreen";
import KYCApprovalScreen from "../../screens/admin/KYCApprovalScreen";

const Stack = createNativeStackNavigator();

export default function AdminStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AdminHome" component={AdminBottomNav} />
            <Stack.Screen name="UsersManagement" component={UsersManagementScreen} />
            <Stack.Screen name="EscrowApproval" component={EscrowApprovalScreen} />
            <Stack.Screen name="AnalyticsScreen" component={AnalyticsScreen} />
            <Stack.Screen name="KYCApproval" component={KYCApprovalScreen} />

        </Stack.Navigator>
    );
}
