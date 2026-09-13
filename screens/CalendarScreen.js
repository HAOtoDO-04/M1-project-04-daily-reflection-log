import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAllEntries } from '../services/storage';
import { calculateStreaks } from '../services/streak';
import StreakCard from '../components/StreakCard';
import JournalCard from '../components/JournalCard';
import { COLORS, SPACING, SHADOWS } from '../style';

export default function CalendarScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(
    new Date().toISOString().split('T')[0]
  );

  const loadData = async () => {
    const list = await getAllEntries();
    setEntries(list);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const streakInfo = calculateStreaks(entries);
  const entryDateSet = new Set(streakInfo.entryDates);

  // Month navigation
  const changeMonth = (increment) => {
    const newDate = new Date(currentMonthDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentMonthDate(newDate);
  };

  // Generate calendar grid days for currentMonthDate
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthYearLabel = currentMonthDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Entries for selected date
  const selectedDateEntries = entries.filter((entry) => {
    if (!entry.createdAt) return entry.date === selectedDateStr;
    const d = new Date(entry.createdAt);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return dateStr === selectedDateStr;
  });

  // Build grid days
  const calendarCells = [];
  // Empty padding cells before first day
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push({ id: `pad_${i}`, isPad: true });
  }
  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push({
      id: dateStr,
      dayNumber: day,
      dateStr,
      hasEntry: entryDateSet.has(dateStr),
      isToday: dateStr === new Date().toISOString().split('T')[0],
      isSelected: dateStr === selectedDateStr,
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Screen Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reflection Calendar</Text>
          <Text style={styles.headerSub}>Track your journaling consistency</Text>
        </View>

        {/* Streak Stats Card */}
        <StreakCard
          currentStreak={streakInfo.currentStreak}
          longestStreak={streakInfo.longestStreak}
        />

        {/* Calendar Card */}
        <View style={styles.calendarCard}>
          {/* Month Switcher Header */}
          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthNavBtn}>
              <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{monthYearLabel}</Text>
            <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthNavBtn}>
              <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Weekday Labels */}
          <View style={styles.weekdaysRow}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((wd) => (
              <Text key={wd} style={styles.weekdayLabel}>
                {wd}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.grid}>
            {calendarCells.map((cell) => {
              if (cell.isPad) {
                return <View key={cell.id} style={styles.cell} />;
              }

              return (
                <TouchableOpacity
                  key={cell.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedDateStr(cell.dateStr)}
                  style={[
                    styles.cell,
                    cell.isToday && styles.todayCell,
                    cell.isSelected && styles.selectedCell,
                  ]}
                >
                  <Text
                    style={[
                      styles.cellDayText,
                      cell.isToday && styles.todayCellText,
                      cell.isSelected && styles.selectedCellText,
                    ]}
                  >
                    {cell.dayNumber}
                  </Text>
                  {cell.hasEntry ? (
                    <View
                      style={[
                        styles.entryDot,
                        cell.isSelected && styles.entryDotSelected,
                      ]}
                    />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Date Entries Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Reflections for {selectedDateStr}
          </Text>
          <Text style={styles.countText}>{selectedDateEntries.length} entries</Text>
        </View>

        {/* Selected Date Entry List */}
        {selectedDateEntries.length > 0 ? (
          selectedDateEntries.map((item) => (
            <JournalCard
              key={item.id}
              entry={item}
              onPress={() => navigation.navigate('JournalDetail', { entryId: item.id })}
            />
          ))
        ) : (
          <View style={styles.noEntriesCard}>
            <Ionicons name="calendar-outline" size={36} color={COLORS.disabled} />
            <Text style={styles.noEntriesText}>No journal entries on this date.</Text>
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
  scrollContent: {
    padding: SPACING.md,
  },
  header: {
    marginBottom: SPACING.sm,
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
  calendarCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  monthNavBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#F0F7F4',
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.xs,
  },
  weekdayLabel: {
    width: '14%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.28%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    borderRadius: 10,
    position: 'relative',
  },
  todayCell: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  selectedCell: {
    backgroundColor: COLORS.primary,
  },
  cellDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  todayCellText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  selectedCellText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  entryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
    position: 'absolute',
    bottom: 4,
  },
  entryDotSelected: {
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  noEntriesCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: SPACING.lg,
    alignItems: 'center',
    marginVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noEntriesText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});
