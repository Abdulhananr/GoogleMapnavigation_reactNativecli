import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import FlashMessage from 'react-native-flash-message';

//Screens
import ChooseLocation from './src/Screens/ChooseLocation';
import Home from './src/Screens/Home';
import Chat from './src/Screens/Chat';


const App = () => {
  const Stack = createStackNavigator()

  return (
    <NavigationContainer>
      <Stack.Navigator>
        
        <Stack.Screen name="home" component={Home} options={{ headerShown: false }}  />
        <Stack.Screen name="chooseLocation" component={ChooseLocation} />
        <Stack.Screen name="Chat" component={Chat} />
      </Stack.Navigator>
      <FlashMessage
        position="top"
      />
    </NavigationContainer>
  );
};

export default App;
