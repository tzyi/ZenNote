import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import { useTheme } from '../theme';
import type { RootStackParamList, DrawerParamList } from './types';

// Lazy import of screens
import MainScreen from '../../screens/MainScreen';
import EditorScreen from '../../screens/EditorScreen';
import SearchScreen from '../../screens/SearchScreen';
import SettingsScreen from '../../screens/SettingsScreen';
import SidebarScreen from '../../screens/SidebarScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

function DrawerNavigator() {
  const { theme } = useTheme();
  return (
    <Drawer.Navigator
      drawerContent={(props) => <SidebarScreen {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerStyle: {
          width: '75%',
          backgroundColor: theme.colors.sidebar,
        },
        overlayColor: 'rgba(0,0,0,0.6)',
        swipeEdgeWidth: 30,
      }}
    >
      <Drawer.Screen name="Main" component={MainScreen} />
      <Drawer.Screen name="Search" component={SearchScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="DailyReview" component={MainScreen} />
    </Drawer.Navigator>
  );
}

export function RootNavigator() {
  const { theme } = useTheme();

  const navTheme = theme.mode === 'dark'
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: theme.colors.background,
          card: theme.colors.card,
          text: theme.colors.textPrimary,
          border: theme.colors.border,
          primary: theme.colors.accentGreen,
          notification: theme.colors.accentRed,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: theme.colors.background,
          card: theme.colors.card,
          text: theme.colors.textPrimary,
          border: theme.colors.border,
          primary: theme.colors.accentGreen,
          notification: theme.colors.accentRed,
        },
      };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="Drawer" component={DrawerNavigator} />
        <Stack.Screen
          name="Editor"
          component={EditorScreen}
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen name="RecycleBin" component={MainScreen} />
        <Stack.Screen name="TagAggregate" component={MainScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
