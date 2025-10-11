import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminStack from "../navigation/admin/AdminStack";
import LenderStack from "./LenderStack";
import RoleSelectionScreen from "../screens/RoleSelectionScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <Stack.Navigator 
            screenOptions={{ headerShown: false }}
            initialRouteName="RoleSelection"
        >
            <Stack.Screen 
                name="RoleSelection" 
                component={RoleSelectionScreen}
                options={{ title: 'Choose Role' }}
            />
            <Stack.Screen 
                name="Admin" 
                component={AdminStack}
                options={{ title: 'Admin Portal' }}
            />
            <Stack.Screen 
                name="Lender" 
                component={LenderStack}
                options={{ title: 'Lender Portal' }}
            />
        </Stack.Navigator>
    );
}
