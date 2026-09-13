import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAllEntries } from '../services/storage';
import { fetchCurrentWeather } from '../services/weather';
import { calculateStreaks } from '../services/streak';
import WeatherWidget from '../components/WeatherWidget';
import StreakCard from '../components/StreakCard';
import JournalCard from '../components/JournalCard';
import { COLORS, SPACING, SHADOWS } from '../style';

export default function HomeScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    // Fetch journal entries
    const loadedEntries = await getAllEntries();
    setEntries(loadedEntries);

    // Fetch Weather
    loadWeather();
  }, []);

  const loadWeather = async () => {
    setWeatherLoading(true);
    setWeatherError(null);
    const result = await fetchCurrentWeather();
    if (result.success) {
      setWeatherData(result.data);
    } else {
      setWeatherError(result.error);
    }
    setWeatherLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const streakInfo = calculateStreaks(entries);
  const recentEntries = entries.slice(0, 3); // top 3 recent entries

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Header Greeting */}
        <View style={styles.header}>
          <View>
            <Text style={styles.dateSubheader}>{todayFormatted}</Text>
            <Text style={styles.headerTitle}>Welcome Back</Text>
          </View>
        </View>

        {/* Primary CTA: Write New Journal */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.newJournalBtn}
          onPress={() => navigation.navigate('CreateEditJournal')}
        >
          <View style={styles.btnIconCircle}>
            <Ionicons name="create" size={22} color={COLORS.primary} />
          </View>
          <View style={styles.btnTextCol}>
            <Text style={styles.btnTitle}>New Journal Entry</Text>
            <Text style={styles.btnSubtitle}>Record your thoughts & mood</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Weather Widget */}
        <WeatherWidget
          weather={weatherData}
          loading={weatherLoading}
          error={weatherError}
          onRefresh={loadWeather}
        />

        {/* Streak Stats Card */}
        <StreakCard
          currentStreak={streakInfo.currentStreak}
          longestStreak={streakInfo.longestStreak}
        />

        {/* Recent Reflections Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Reflections</Text>
          {entries.length > 0 ? (
            <TouchableOpacity onPress={() => navigation.navigate('History')}>
              <Text style={styles.viewAllText}>View All ({entries.length})</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Recent Journal List */}
        {recentEntries.length > 0 ? (
          recentEntries.map((item) => (
            <JournalCard
              key={item.id}
              entry={item}
              onPress={() => navigation.navigate('JournalDetail', { entryId: item.id })}
            />
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="journal-outline" size={40} color={COLORS.disabled} />
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptySub}>
              Tap "New Journal Entry" above to write your first reflection today!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  header: {
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  dateSubheader: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  newJournalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 18,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  btnIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  btnTextCol: {
    flex: 1,
  },
  btnTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  btnSubtitle: {
    color: '#D8E2DC',
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: 'center',
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});
