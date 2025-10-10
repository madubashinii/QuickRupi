// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { StatusBar } from 'expo-status-bar';
// import LenderTabs from './navigation/LenderTabs';
// import NotificationsScreen from './screens/LenderScreens/Notifications';
// import MessagesScreen from './screens/LenderScreens/MessagesScreen';
// import Toast from 'react-native-toast-message';

// const Stack = createNativeStackNavigator();

// export default function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="MainTabs" component={LenderTabs} />
//         <Stack.Screen name="Notifications" component={NotificationsScreen} />
//         <Stack.Screen name="Messages" component={MessagesScreen} />
//       </Stack.Navigator>
//       <Toast />
//       <StatusBar style="light" />
//     </NavigationContainer>
//   );
// }


import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { RoleProvider } from './context/RoleContext';
import RootNavigator from './navigation/RootNavigator';

export default function App() {
  return (
    <RoleProvider>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style="light" />
      </NavigationContainer>
    </RoleProvider>
  );
}
