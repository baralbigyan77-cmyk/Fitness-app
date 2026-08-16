import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserProvider, useUser } from './lib/UserContext';
import { colors } from './lib/theme';
import { MainTabParamList, RootStackParamList } from './lib/navigation';
import OnboardingScreen from './screens/OnboardingScreen';
import TodayScreen from './screens/TodayScreen';
import PlanScreen from './screens/PlanScreen';
import ProgressScreen from './screens/ProgressScreen';
import ProfileScreen from './screens/ProfileScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import PaywallScreen from './screens/PaywallScreen';

export type { RootStackParamList };

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    border: colors.line,
    primary: colors.lime,
  },
};

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.lime,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, size, focused }) => {
          const map: Record<string, keyof typeof Ionicons.glyphMap> = {
            Today: focused ? 'flash' : 'flash-outline',
            Plan: focused ? 'calendar' : 'calendar-outline',
            Progress: focused ? 'stats-chart' : 'stats-chart-outline',
            You: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={map[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="Today" component={TodayScreen} />
      <Tabs.Screen name="Plan" component={PlanScreen} />
      <Tabs.Screen name="Progress" component={ProgressScreen} />
      <Tabs.Screen name="You" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

function Root() {
  const { ready, profile } = useUser();

  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.lime} size="large" />
      </View>
    );
  }

  if (!profile) {
    return <OnboardingScreen />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Workout" component={WorkoutScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <UserProvider>
          <StatusBar style="light" />
          <Root />
        </UserProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    backgroundColor: '#0B0E0C',
    borderTopColor: colors.line,
    borderTopWidth: 1,
    height: 64,
    paddingTop: 6,
    paddingBottom: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
});
