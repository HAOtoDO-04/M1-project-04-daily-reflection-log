import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Services & Constants
import { getAppLockStatus } from './services/security';
import { COLORS } from './style';

// Screens
import HomeScreen from './screens/HomeScreen';
import HistoryScreen from './screens/HistoryScreen';
import CalendarScreen from './screens/CalendarScreen';
import SettingsScreen from './screens/SettingsScreen';
import CreateEditJournalScreen from './screens/CreateEditJournalScreen';
import JournalDetailScreen from './screens/JournalDetailScreen';
import LockScreen from './screens/LockScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textSecondary,
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: COLORS.border,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'History') {
                        iconName = focused ? 'journal' : 'journal-outline';
                    } else if (route.name === 'Calendar') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'Settings') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: 'Home', tabBarAccessibilityLabel: 'Home tab' }}
            />
            <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{ title: 'History', tabBarAccessibilityLabel: 'Reflection History tab' }}
            />
            <Tab.Screen
                name="Calendar"
                component={CalendarScreen}
                options={{ title: 'Calendar', tabBarAccessibilityLabel: 'Reflection Calendar tab' }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: 'Settings', tabBarAccessibilityLabel: 'Settings and Privacy tab' }}
            />
        </Tab.Navigator>
    );
}

export default function App() {
    const [isLocked, setIsLocked] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkLockStatus();
    }, []);

    const checkLockStatus = async () => {
        const lockEnabled = await getAppLockStatus();
        setIsLocked(lockEnabled);
        setLoading(false);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (isLocked) {
        return (
            <SafeAreaProvider>
                <StatusBar style="light" />
                <LockScreen onUnlock={() => setIsLocked(false)} />
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <StatusBar style="dark" />
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="MainTabs" component={MainTabs} />
                    <Stack.Screen
                        name="CreateEditJournal"
                        component={CreateEditJournalScreen}
                        options={{ animation: 'slide_from_bottom' }}
                    />
                    <Stack.Screen
                        name="JournalDetail"
                        component={JournalDetailScreen}
                        options={{ animation: 'slide_from_right' }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
