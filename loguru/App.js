import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import Home from './src/screens/Home';
import Account from './src/screens/Account';
import LogeCreate from './src/screens/LogeCreate';
import Photo from './src/screens/Photo';
import LogeView from './src/screens/LogeView';
import NewCreate from './src/screens/NewCreate';
import CalendarScreen from './src/screens/Calendar';
import MemberSelect from './src/screens/MemberSelect';
import GPSConfirmation from './src/screens/GPSCofirmation';
import RouteMap from './src/screens/RouteMap';
import LogCreation from './src/screens/LogCreation';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function LogeCreateStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="LogeCreateScreen" 
        component={LogeCreate} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="NewCreate" 
        component={NewCreate}
        options={{ title: '新規ログ作成' }}
      />
      <Stack.Screen 
        name="Calendar" 
        component={CalendarScreen}
        options={{ title: '日程選択' }}
      />
      <Stack.Screen
      name="MemberSelect"
      component={MemberSelect}
      options={{ title: 'メンバー選択' }}
      />
      <Stack.Screen 
        name="GPSConfirmation" 
        component={GPSConfirmation}
        options={{ 
          title: 'GPS確認',
          presentation: 'transparentModal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="RouteMap"
        component={RouteMap}
        options={{ title: 'ログ詳細' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
            <Stack.Screen
        name="LogCreation"
        component={LogCreation}
        options={{ title: 'ログ記録' }}
      />
      <Tab.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#9E9E9E',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
          },
          tabBarInactiveTintColor: "#9E9E9E",
          tabBarActiveTintColor: "#C1A14E",
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={Home} 
          options={{
            title: 'ホーム',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="account"
          component={Account}
          options={{
            title: 'アカウント',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="account" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="LogeCreate"
          component={LogeCreateStack}
          options={{
            title: 'ログ作成',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="fountain-pen-tip" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="LogeView"
          component={LogeView}
          options={{
            title: 'ログ確認',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="receipt" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Photo"
          component={Photo}
          options={{
            title: '写真閲覧',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="camera" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}