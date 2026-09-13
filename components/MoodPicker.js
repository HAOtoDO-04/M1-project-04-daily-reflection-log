import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MOODS, COLORS, SPACING, SHADOWS } from '../style';

export default function MoodPicker({ selectedMood, onSelectMood, intensity, onSelectIntensity }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>How are you feeling today?</Text>

      {/* Mood Choice Emojis */}
      <View style={styles.moodRow}>
        {MOODS.map((item) => {
          const isSelected = selectedMood === item.emoji;
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={() => onSelectMood(item.emoji)}
              style={[
                styles.moodButton,
                isSelected && styles.moodButtonSelected,
              ]}
            >
              <Text style={styles.emojiText}>{item.emoji}</Text>
              <Text style={[styles.moodLabel, isSelected && styles.moodLabelSelected]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Mood Intensity Rating (1 to 5) */}
      {selectedMood ? (
        <View style={styles.intensityContainer}>
          <Text style={styles.intensityLabel}>
            Mood Intensity: <Text style={styles.intensityValue}>{intensity} / 5</Text>
          </Text>
          <View style={styles.intensityRow}>
            {[1, 2, 3, 4, 5].map((level) => {
              const isCurrent = intensity === level;
              return (
                <TouchableOpacity
                  key={level}
                  activeOpacity={0.7}
                  onPress={() => onSelectIntensity(level)}
                  style={[
                    styles.levelBadge,
                    isCurrent && styles.levelBadgeSelected,
                  ]}
                >
                  <Text style={[styles.levelText, isCurrent && styles.levelTextSelected]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
    backgroundColor: COLORS.cardBg,
    padding: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 56,
  },
  moodButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F7F4',
  },
  emojiText: {
    fontSize: 28,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  moodLabelSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  intensityContainer: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  intensityLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  intensityValue: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  intensityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelBadge: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  levelBadgeSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  levelTextSelected: {
    color: '#FFFFFF',
  },
});
