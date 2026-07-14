import React from 'react';
import {Text, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../theme/colors';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';

import SelectUserTypeScreen from '../screens/SelectUserTypeScreen';
import EmployeeRegistrationScreen from '../screens/EmployeeRegistrationScreen';
import DeliveryLogisticsRegistrationScreen from '../screens/DeliveryLogisticsRegistrationScreen';
import HomeScreen from '../screens/HomeScreen';
import DeliveryListScreen from '../screens/DeliveryListScreen';
import DeliveryDetailScreen from '../screens/DeliveryDetailScreen';
import ScanScreen from '../screens/ScanScreen';
import PODScreen from '../screens/PODScreen';
import ReturnsScreen from '../screens/ReturnsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import RouteScreen from '../screens/RouteScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TermsScreen from '../screens/TermsScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({label, focused}) {
  const iconConfig = {
    Home: {lib: 'feather', name: 'home'},
    Deliveries: {lib: 'mc', name: 'truck-fast-outline'},
    Scan: {lib: 'mc', name: 'qrcode-scan'},
    Returns: {lib: 'feather', name: 'rotate-ccw'},
    Profile: {lib: 'feather', name: 'user'},
  };

  const config = iconConfig[label];
  const color = focused ? COLORS.PRIMARY : '#999';
  const IconComponent = config.lib === 'mc' ? IconMC : Icon;

  return (
    <View style={{alignItems: 'center', justifyContent: 'center', width: 60}}>
      <IconComponent name={config.name} size={22} color={color} />
      <Text
        style={{
          fontSize: 10,
          color: color,
          fontWeight: focused ? '700' : '500',
          marginTop: 4,
        }}
        numberOfLines={1}>
        {label}
      </Text>
      {focused && <View style={{
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.PRIMARY,
        marginTop: 2,
      }} />}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: COLORS.WHITE,
          borderTopColor: 'transparent',
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -3},
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({focused}) => <TabIcon label="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Deliveries"
        component={DeliveryListScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon label="Deliveries" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarIcon: ({focused}) => <TabIcon label="Scan" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Returns"
        component={ReturnsScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon label="Returns" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon label="Profile" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="SelectUserType" component={SelectUserTypeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
       
        <Stack.Screen name="EmployeeRegistration" component={EmployeeRegistrationScreen} />
        <Stack.Screen name="DeliveryLogisticsRegistration" component={DeliveryLogisticsRegistrationScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="DeliveryDetail" component={DeliveryDetailScreen} />
        <Stack.Screen name="POD" component={PODScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Route" component={RouteScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
