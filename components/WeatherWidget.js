import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../style';

export default function WeatherWidget({ weather, loading, error, onRefresh }) {
  if (loading) {
    return (
      <View
        style={[styles.container, styles.centerContent]}
        accessible={true}
        accessibilityLabel="Fetching today's weather..."
      >
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Fetching today's weather...</Text>
      </View>
    );
  }

  if (error && !weather) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.container}
        onPress={onRefresh}
        accessibilityRole="button"
        accessibilityLabel="Weather unavailable. Tap to retry loading weather."
        accessibilityHint="Retries fetching weather data"
      >
        <View style={styles.errorRow}>
          <Ionicons name="cloud-offline-outline" size={24} color={COLORS.danger} />
          <View style={styles.errorTextCol}>
            <Text style={styles.errorTitle}>Weather Unavailable</Text>
            <Text style={styles.errorSub}>Tap to retry loading</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (!weather) return null;

  return (
    <View style={styles.container}>
      <View style={styles.contentRow}>
        <View
          style={styles.weatherInfo}
          accessible={true}
          accessibilityLabel={`Current weather: ${weather.condition}, ${weather.temp} degrees Celsius in ${weather.location}`}
        >
          <View style={styles.tempRow}>
            <Text style={styles.iconText}>{weather.icon}</Text>
            <Text style={styles.tempText}>{weather.temp}°C</Text>
          </View>
          <Text style={styles.conditionText}>{weather.condition}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.locationText}>{weather.location}</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.6}
          style={styles.refreshBtn}
          onPress={onRefresh}
          accessibilityRole="button"
          accessibilityLabel="Refresh weather data"
          accessibilityHint="Fetches current weather snapshot"
        >
          <Ionicons name="refresh-outline" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F7F4',
    borderRadius: 16,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: '#D8E2DC',
    ...SHADOWS.small,
  },
  centerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  loadingText: {
    marginLeft: SPACING.sm,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherInfo: {
    flex: 1,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
    marginRight: 6,
  },
  tempText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  conditionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  refreshBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorTextCol: {
    marginLeft: SPACING.sm,
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.danger,
  },
  errorSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
