import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const APP_LOCK_SETTING_KEY = '@mydaily_app_lock_enabled';

/**
 * Check if the device supports biometric/passcode authentication.
 */
export const isBiometricSupported = async () => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  } catch (error) {
    console.error('Error checking biometric support:', error);
    return false;
  }
};

/**
 * Check if app lock feature is enabled by user.
 */
export const getAppLockStatus = async () => {
  try {
    const value = await AsyncStorage.getItem(APP_LOCK_SETTING_KEY);
    return value === 'true';
  } catch (error) {
    return false;
  }
};

/**
 * Toggle app lock setting.
 */
export const setAppLockStatus = async (enabled) => {
  try {
    await AsyncStorage.setItem(APP_LOCK_SETTING_KEY, enabled ? 'true' : 'false');
    return true;
  } catch (error) {
    console.error('Error toggling app lock status:', error);
    return false;
  }
};

/**
 * Prompt device biometric/passcode authentication.
 */
export const authenticateUser = async (reason = 'Unlock MyDaily to access your private journal') => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      fallbackLabel: 'Use Device Passcode',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch (error) {
    console.error('Authentication error:', error);
    return false;
  }
};
