import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Home from './src/screens/Home';
import Account from './src/screens/Account';
import LoguCreate from './src/screens/LogeCreate';
import Photo from './src/screens/Photo';
import LoguView from './src/screens/LogeView';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
  <NavigationContainer>
    <Tab.Navigator>
      <Tab.Screen 
        name="Home" 
        component={Home} 
      />
      <Tab.Screen
        name="Account"
        component={Account}
      />
      <Tab.Screen
        name="LoguCreate"
        component={LoguCreate}
      />
      <Tab.Screen
        name="LoguView"
        component={LoguView}
      />
      <Tab.Screen
        name="Photo"
        component={Photo}
      />
    </Tab.Navigator>
  </NavigationContainer>
  );
}