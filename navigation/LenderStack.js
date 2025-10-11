import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LenderTabs from "./LenderTabs";
import MessagesScreen from "../screens/LenderScreens/MessagesScreen";
import Notifications from "../screens/LenderScreens/Notifications";

const Stack = createNativeStackNavigator();

export default function LenderStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="LenderHome" component={LenderTabs} />
            <Stack.Screen name="Messages" component={MessagesScreen} />
            <Stack.Screen name="Notifications" component={Notifications} />
        </Stack.Navigator>
    );
}

