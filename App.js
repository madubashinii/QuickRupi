import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import BorrowerDashboard from './screens/borrower/BorrowerDashboard';
import { NavigationContainer } from '@react-navigation/native';
//import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigator from "./navigation/AppNavigator";
import BorrowerBottomNav from "./navigation/borrower/borrowerNav";

//const Stack = createNativeStackNavigator();


export default function App() {
  return (

    <NavigationContainer>
      {/*<Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BorrowerApp" component={BorrowerBottomNav} />
      </Stack.Navigator>*/}
      <AppNavigator />
    </NavigationContainer>
    
  );
    //<View style={styles.container}>
     // {/*<Text>Open up App.js to start working on your app!</Text>*/}
     // <BorrowerDashboard />
    //  <StatusBar style="auto" />
    //</View>
  //);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
