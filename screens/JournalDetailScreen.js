import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getEntryById, deleteEntry } from '../services/storage';
import { COLORS, SPACING, SHADOWS } from '../style';

export default function JournalDetailScreen({ route, navigation }) {
  const { entryId } = route.params || {};
  const [entry, setEntry] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchDetails = async () => {
    if (!entryId) return;
    const data = await getEntryById(entryId);
    if (data) {
      setEntry(data);
    } else {
      Alert.alert('Error', 'Journal entry not found.');
      navigation.goBack();
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetails();
    }, [entryId])
  );

  const handleDelete = async () => {
    setShowDeleteModal(false);
    const result = await deleteEntry(entryId);
    if (result.success) {
      Alert.alert('Deleted', 'The entry has been deleted.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Error', result.error || 'Failed to delete entry.');
    }
  };

  if (!entry) return null;

  const dateStr = new Date(entry.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const timeStr = new Date(entry.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Navigation Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Navigates to previous screen"
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} accessible={true} accessibilityRole="header">Reflection Detail</Text>
          <View style={styles.headerActionGroup}>
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateEditJournal', { entryId })}
              style={styles.iconBtn}
              accessibilityRole="button"
              accessibilityLabel="Edit reflection entry"
            >
              <Ionicons name="pencil" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowDeleteModal(true)}
              style={styles.iconBtn}
              accessibilityRole="button"
              accessibilityLabel="Delete reflection entry"
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Date & Time Header */}
          <View style={styles.dateHeader}>
            <Text style={styles.dateText}>{dateStr}</Text>
            <Text style={styles.timeText}>{timeStr}</Text>
          </View>

          {/* Mood & Intensity Card */}
          <View style={styles.moodCard}>
            <Text style={styles.cardSectionLabel}>Mood Reflection</Text>
            <View style={styles.moodDetailRow}>
              <Text style={styles.moodEmoji}>{entry.mood}</Text>
              <View style={styles.intensityCol}>
                <Text style={styles.intensityLabel}>Intensity Level</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <Ionicons
                      key={lvl}
                      name={lvl <= entry.moodIntensity ? 'star' : 'star-outline'}
                      size={18}
                      color={lvl <= entry.moodIntensity ? COLORS.accent : COLORS.disabled}
                      style={{ marginRight: 2 }}
                    />
                  ))}
                  <Text style={styles.intensityNum}>({entry.moodIntensity}/5)</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Weather Snapshot if available */}
          {entry.weather ? (
            <View style={styles.weatherCard}>
              <Text style={styles.cardSectionLabel}>Weather Context</Text>
              <View style={styles.weatherRow}>
                <Text style={styles.weatherIcon}>{entry.weather.icon}</Text>
                <View>
                  <Text style={styles.weatherTemp}>
                    {entry.weather.temp}°C — {entry.weather.condition}
                  </Text>
                  <Text style={styles.weatherLoc}>{entry.weather.location}</Text>
                </View>
              </View>
            </View>
          ) : null}

          {/* Note Text Content */}
          <View style={styles.textCard}>
            <Text style={styles.cardSectionLabel}>Journal Note</Text>
            <Text style={styles.fullText}>{entry.text}</Text>
          </View>

          {/* Photo Attachment View */}
          {entry.photoUri ? (
            <View style={styles.photoCard}>
              <Text style={styles.cardSectionLabel}>Saved Photo Memory</Text>
              <Image
                source={{ uri: entry.photoUri }}
                style={styles.fullPhoto}
                accessible={true}
                accessibilityRole="image"
                accessibilityLabel="Saved full size photo memory"
              />
            </View>
          ) : null}

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 ? (
            <View style={styles.tagsCard}>
              <Text style={styles.cardSectionLabel}>Tags</Text>
              <View style={styles.tagsRow}>
                {entry.tags.map((tag, idx) => (
                  <View key={idx} style={styles.tagBadge}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>

        {/* Explicit Confirmation Dialog for Deletion */}
        <Modal
          visible={showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Ionicons name="alert-circle" size={44} color={COLORS.danger} />
              <Text style={styles.modalTitle}>Delete Entry?</Text>
              <Text style={styles.modalBody}>
                This will permanently delete your journal reflection for {dateStr}. This action cannot be reversed.
              </Text>
              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.cancelModalBtn}
                  onPress={() => setShowDeleteModal(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel entry deletion"
                >
                  <Text style={styles.cancelModalText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteModalBtn}
                  onPress={handleDelete}
                  accessibilityRole="button"
                  accessibilityLabel="Confirm permanent delete"
                >
                  <Text style={styles.deleteModalText}>Confirm Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    padding: SPACING.md,
  },
  dateHeader: {
    marginBottom: SPACING.md,
  },
  dateText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  timeText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cardSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  moodCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  moodDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  moodEmoji: {
    fontSize: 36,
    marginRight: SPACING.md,
  },
  intensityCol: {
    flex: 1,
  },
  intensityLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intensityNum: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 6,
  },
  weatherCard: {
    backgroundColor: '#F0F7F4',
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#D8E2DC',
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  weatherIcon: {
    fontSize: 28,
    marginRight: 10,
  },
  weatherTemp: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  weatherLoc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  textCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  fullText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 24,
    marginTop: 4,
  },
  photoCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  fullPhoto: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    resizeMode: 'cover',
    marginTop: SPACING.xs,
  },
  tagsCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  tagBadge: {
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: SPACING.lg,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    ...SHADOWS.medium,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  modalBody: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: SPACING.md,
    lineHeight: 18,
  },
  modalActionRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    marginRight: 6,
  },
  cancelModalText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  deleteModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    marginLeft: 6,
  },
  deleteModalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
