import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  getAppLockStatus,
  setAppLockStatus,
  isBiometricSupported,
  authenticateUser,
} from '../services/security';
import { getAllEntries } from '../services/storage';
import { COLORS, SPACING, SHADOWS } from '../style';

export default function SettingsScreen() {
  const [appLockEnabled, setAppLockEnabled] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const lockStatus = await getAppLockStatus();
    const isSupported = await isBiometricSupported();
    const entries = await getAllEntries();

    setAppLockEnabled(lockStatus);
    setBiometricsAvailable(isSupported);
    setTotalEntries(entries.length);
  };

  const handleToggleLock = async (newValue) => {
    if (newValue) {
      // Test device authentication before enabling
      const success = await authenticateUser(
        'Verify your phone biometric / passcode to enable App Lock'
      );

      if (success) {
        await setAppLockStatus(true);
        setAppLockEnabled(true);
        Alert.alert('App Lock Enabled', 'MyDaily will now require phone authentication upon startup.');
      } else {
        Alert.alert('Authentication Failed', 'Could not verify device lock. App Lock remains off.');
        setAppLockEnabled(false);
      }
    } else {
      // Authenticate to disable
      const success = await authenticateUser(
        'Verify your phone biometric / passcode to disable App Lock'
      );

      if (success) {
        await setAppLockStatus(false);
        setAppLockEnabled(false);
        Alert.alert('App Lock Disabled', 'App Lock has been turned off.');
      } else {
        Alert.alert('Authentication Failed', 'Verification failed. App Lock remains enabled.');
        setAppLockEnabled(true);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header} accessible={true} accessibilityRole="header" accessibilityLabel="Settings & Privacy. Manage your app preferences and protection">
          <Text style={styles.headerTitle}>Settings & Privacy</Text>
          <Text style={styles.headerSub}>Manage your app preferences and protection</Text>
        </View>

        {/* Security & App Lock Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="shield-checkmark" size={22} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Privacy & Security</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLabelCol}>
              <Text style={styles.settingTitle}>Phone Lock / Biometric Auth</Text>
              <Text style={styles.settingSub}>
                Require Face ID, Touch ID, or phone passcode to open MyDaily
              </Text>
            </View>
            <Switch
              value={appLockEnabled}
              onValueChange={handleToggleLock}
              trackColor={{ false: COLORS.disabled, true: COLORS.primaryLight }}
              thumbColor={appLockEnabled ? COLORS.primary : '#F4F3F4'}
              accessibilityRole="switch"
              accessibilityLabel="Phone Lock and Biometric Authentication"
              accessibilityState={{ checked: appLockEnabled }}
              accessibilityHint="Toggles app lock security requirement when opening the app"
            />
          </View>

          {!biometricsAvailable ? (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.infoBoxText}>
                Note: Ensure phone screen lock (PIN/FaceID) is set up in your phone settings to use this security feature.
              </Text>
            </View>
          ) : null}
        </View>

        {/* Weather API Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="cloudy-night" size={22} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Weather Service</Text>
          </View>
          <Text style={styles.cardBodyText}>
            MyDaily uses keyless weather forecasts powered by Open-Meteo. Today's weather snapshots are automatically cached locally so you can log your reflections even when offline.
          </Text>
        </View>

        {/* App Data Summary */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="stats-chart" size={22} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Journal Summary</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Journal Reflections</Text>
            <Text style={styles.statVal}>{totalEntries}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Storage Type</Text>
            <Text style={styles.statVal}>Local Device</Text>
          </View>
        </View>

        {/* About App */}
        <View style={styles.aboutFooter}>
          <Text style={styles.aboutTitle}>MyDaily Journal</Text>
          <Text style={styles.aboutSub}>Version 1.0.0 — Simple, Calming Daily Reflection</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  header: {
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  cardBodyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLabelCol: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  settingSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: SPACING.sm,
    borderRadius: 10,
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  infoBoxText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6,
    flex: 1,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  statVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  aboutFooter: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  aboutTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  aboutSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
