import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import BorrowerDashboard from './screens/borrower/BorrowerDashboard';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();


export default function App() {
  return (

    <NavigationContainer>
      <Stack.Navigator initialRouteName="BorrowerDashboard">
        <Stack.Screen 
          name="BorrowerDashboard" 
          component={HomeScreen} 
          options={{ title: 'Welcome' }}
        />
      </Stack.Navigator>
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
