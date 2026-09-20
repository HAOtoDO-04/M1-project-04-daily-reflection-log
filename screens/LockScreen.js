import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authenticateUser } from '../services/security';
import { COLORS, SPACING, SHADOWS } from '../style';

export default function LockScreen({ onUnlock }) {
  const [authenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    // Attempt biometric prompt automatically when lock screen mounts
    triggerAuth();
  }, []);

  const triggerAuth = async () => {
    setAuthenticating(true);
    const success = await authenticateUser('Unlock MyDaily to access your private journal');
    setAuthenticating(false);

    if (success) {
      onUnlock();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.contentCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed" size={48} color={COLORS.primary} />
          </View>

          <Text style={styles.title} accessible={true} accessibilityRole="header">MyDaily Protected</Text>
          <Text style={styles.subtitle}>
            Your journal reflections are locked to protect your personal privacy.
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.unlockBtn}
            onPress={triggerAuth}
            disabled={authenticating}
            accessibilityRole="button"
            accessibilityLabel={authenticating ? 'Verifying device authentication' : 'Unlock Journal'}
            accessibilityHint="Prompts for Face ID, Touch ID, or phone passcode to unlock"
            accessibilityState={{ disabled: authenticating }}
          >
            <Ionicons name="finger-print-outline" size={24} color="#FFFFFF" />
            <Text style={styles.unlockBtnText}>
              {authenticating ? 'Verifying...' : 'Unlock Journal'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  contentCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    ...SHADOWS.medium,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F7F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.xl,
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 16,
    width: '100%',
    ...SHADOWS.small,
  },
  unlockBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});
