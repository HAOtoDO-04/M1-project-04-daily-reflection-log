import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../style';

export default function JournalCard({ entry, onPress }) {
  const formattedDate = new Date(entry.createdAt).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const previewText =
    entry.text.length > 110 ? entry.text.substring(0, 110) + '...' : entry.text;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.card}
    >
      {/* Header Row: Date & Mood Badge */}
      <View style={styles.headerRow}>
        <Text style={styles.dateText}>{formattedDate}</Text>
        <View style={styles.moodBadge}>
          <Text style={styles.moodEmoji}>{entry.mood}</Text>
          <Text style={styles.intensityText}>{entry.moodIntensity}/5</Text>
        </View>
      </View>

      {/* Main Content: Text Preview & Optional Thumbnail */}
      <View style={styles.contentRow}>
        <View style={styles.textContainer}>
          <Text style={styles.previewText}>{previewText}</Text>
        </View>
        {entry.photoUri ? (
          <Image source={{ uri: entry.photoUri }} style={styles.thumbnail} />
        ) : null}
      </View>

      {/* Footer: Tags & Weather Snapshot */}
      <View style={styles.footerRow}>
        <View style={styles.tagsContainer}>
          {entry.tags && entry.tags.length > 0 ? (
            entry.tags.map((tag, idx) => (
              <View key={idx} style={styles.tagBadge}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noTagsText}>No tags</Text>
          )}
        </View>

        {entry.weather ? (
          <View style={styles.weatherBadge}>
            <Text style={styles.weatherText}>
              {entry.weather.icon} {entry.weather.temp}°C
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7F4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moodEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  intensityText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  contentRow: {
    flexDirection: 'row',
    marginVertical: SPACING.xs,
  },
  textContainer: {
    flex: 1,
    paddingRight: SPACING.xs,
  },
  previewText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
    resizeMode: 'cover',
    marginLeft: SPACING.xs,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  tagBadge: {
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 2,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  noTagsText: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  weatherBadge: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  weatherText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
  },
});
