import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LenderTabs from './LenderTabs';
import NotificationsScreen from '../../screens/LenderScreens/Notifications';
import MessagesScreen from '../../screens/LenderScreens/MessagesScreen';

const Stack = createNativeStackNavigator();

export default function LenderNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="LenderTabs" component={LenderTabs} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Messages" component={MessagesScreen} />
        </Stack.Navigator>
    );
}
