import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../style';



export default function TagSelector({ selectedTags = [], onToggleTag, label = 'Select Tags' }) {
  const PREDEFINED_TAGS = [
    'School',
    'Friends',
    'Family',
    'Hobbies',
    'Travel',
    'Other',
  ];
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.tagWrap}>
        {PREDEFINED_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <TouchableOpacity
              key={tag}
              activeOpacity={0.7}
              onPress={() => onToggleTag(tag)}
              style={[
                styles.badge,
                isSelected && styles.badgeSelected,
              ]}
            >
              <Text style={[styles.badgeText, isSelected && styles.badgeTextSelected]}>
                {isSelected ? '✓ ' : ''}#{tag}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  badgeSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  badgeTextSelected: {
    color: '#FFFFFF',
  },
});
