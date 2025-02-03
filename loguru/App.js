import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import Home from "./src/screens/Home";
import Account from "./src/screens/Account/Account";
import AccountDetails from './src/screens/Account/AccountDetails'
import LogeCreate from "./src/screens/LogeCreate";
import Photo from "./src/screens/Photo.js";
import LogeView from "./src/screens/LogeView";
import NewCreate from "./src/screens/NewCreate";
import CalendarScreen from "./src/screens/Calendar";
import MemberSelect from "./src/screens/MemberSelect";
import GPSConfirmation from "./src/screens/GPSCofirmation";
import RouteMap from "./src/screens/RouteMap";
import LogCreation from "./src/screens/LogCreation";
import PhotoUpload from "./src/screens/PhotoUpload";
import PhotoTag from "./src/screens/PhotoTag"; // Import PhotoTag component
import SignIn from './src/screens/Auth/SignIn';
import SignUp from './src/screens/Auth/SignUp';
import ChangeUserName from './src/screens/Account/ChangeUserName'
import ChangePassword from './src/screens/Account/ChangePassword'
import ChangeEmail from './src/screens/Account/ChangeEmail'
import CreateNewPassword from './src/screens/Account/CreateNewPassword';
import LikeList from './src/screens/Account/LikeList'
import ConfirmSignUp from './src/screens/Auth/ConfirmSignUp'
import RouteMapView from "./src/screens/RouteMapView";

import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs)

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
        options={{ title: "新規ログ作成" }}
      />
      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ title: "日程選択" }}
      />
      <Stack.Screen
        name="MemberSelect"
        component={MemberSelect}
        options={{ title: "メンバー選択" }}
      />
      <Stack.Screen
        name="GPSConfirmation"
        component={GPSConfirmation}
        options={{
          title: "GPS確認",
          presentation: "transparentModal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="RouteMap"
        component={RouteMap}
        options={{ title: "ログ詳細" }}
      />
      <Stack.Screen
        name="LogCreation"
        component={LogCreation}
        options={{ title: "ログ作成" }}
      />
      <Stack.Screen
        name="PhotoUpload"
        component={PhotoUpload}
        options={{ title: "写真アップロード" }}
      />
    </Stack.Navigator>
  );
}

// HomeStackの定義
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function PhotoStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PhotoScreen"
        component={Photo}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PhotoUpload"
        component={PhotoUpload}
        options={{ title: "写真アップロード" }}
      />
      <Stack.Screen
        name="PhotoTag"
        component={PhotoTag}
        options={{ title: "タグ付け" }}
      />
    </Stack.Navigator>
  );
}

// AccountStackの定義
function AccountStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Account"
        component={Account}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AccountDetails"
        component={AccountDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChangeUserName"
        component={ChangeUserName}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePassword}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChangeEmail"
        component={ChangeEmail}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateNewPassword"
        component={CreateNewPassword}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LikeList"
        component={LikeList}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )
}

// タブナビゲーションの定義
function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
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
        name="HomeTab"
        component={HomeStack}
        options={{
          title: 'ホーム',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AccountStack"
        component={AccountStack}
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
        component={PhotoStack}
        options={{
          title: "写真閲覧",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="camera" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Main App Component
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainTabs">
        {/* タブナビゲーションを設定 */}
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        {/* タブを表示しない画面を定義 */}
        <Stack.Screen
          name="SignIn"
          component={SignIn}
          options={{ title: 'サインイン', headerShown: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUp}
          options={{ title: 'サインアップ', headerShown: false }}
        />
        {/* RouteMapViewをスタックに追加 */}
        <Stack.Screen
          name="RouteMapView"
          component={RouteMapView}
          options={{ title: 'ルートマップ', headerShown: true }}
        />
                <Stack.Screen
          name="ConfirmSignUp"
          component={ConfirmSignUp}
          options={{ title: 'サンアップ確認', headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}