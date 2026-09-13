import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAllEntries, deleteEntry } from '../services/storage';
import JournalCard from '../components/JournalCard';
import TagSelector from '../components/TagSelector';
import { MOODS, COLORS, SPACING, SHADOWS } from '../style';

export default function HistoryScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState(null);
  const [selectedTagFilters, setSelectedTagFilters] = useState([]);
  const [entryToDelete, setEntryToDelete] = useState(null);

  const loadEntries = async () => {
    const list = await getAllEntries();
    setEntries(list);
  };

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [])
  );

  const handleToggleTagFilter = (tag) => {
    if (selectedTagFilters.includes(tag)) {
      setSelectedTagFilters(selectedTagFilters.filter((t) => t !== tag));
    } else {
      setSelectedTagFilters([...selectedTagFilters, tag]);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedMoodFilter(null);
    setSelectedTagFilters([]);
  };

  const confirmDelete = async () => {
    if (!entryToDelete) return;
    const result = await deleteEntry(entryToDelete.id);
    setEntryToDelete(null);
    if (result.success) {
      setEntries(result.entries);
      Alert.alert('Deleted', 'The journal entry has been permanently removed.');
    } else {
      Alert.alert('Error', result.error || 'Failed to delete entry.');
    }
  };

  // Filter Logic
  const filteredEntries = entries.filter((entry) => {
    // Keyword match
    const textMatch =
      !searchQuery.trim() ||
      entry.text.toLowerCase().includes(searchQuery.toLowerCase());

    // Mood filter match
    const moodMatch = !selectedMoodFilter || entry.mood === selectedMoodFilter;

    // Tag filter match
    const tagMatch =
      selectedTagFilters.length === 0 ||
      selectedTagFilters.every((tag) => entry.tags && entry.tags.includes(tag));

    return textMatch && moodMatch && tagMatch;
  });

  const hasActiveFilters = Boolean(
    searchQuery.trim() || selectedMoodFilter || selectedTagFilters.length > 0
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reflection History</Text>
          {hasActiveFilters ? (
            <TouchableOpacity onPress={handleClearFilters} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Clear Filters</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search journal entries..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Mood Filter Pill Strip */}
        <View style={styles.filterStrip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              onPress={() => setSelectedMoodFilter(null)}
              style={[
                styles.moodPill,
                selectedMoodFilter === null && styles.moodPillSelected,
              ]}
            >
              <Text
                style={[
                  styles.moodPillText,
                  selectedMoodFilter === null && styles.moodPillTextSelected,
                ]}
              >
                All Moods
              </Text>
            </TouchableOpacity>
            {MOODS.map((item) => {
              const isSelected = selectedMoodFilter === item.emoji;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSelectedMoodFilter(isSelected ? null : item.emoji)}
                  style={[
                    styles.moodPill,
                    isSelected && styles.moodPillSelected,
                  ]}
                >
                  <Text style={styles.moodEmoji}>{item.emoji}</Text>
                  <Text
                    style={[
                      styles.moodPillText,
                      isSelected && styles.moodPillTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Tag Filter Selector */}
        <View style={styles.tagFilterSection}>
          <TagSelector
            selectedTags={selectedTagFilters}
            onToggleTag={handleToggleTagFilter}
            label=""
          />
        </View>

        {/* Entry List */}
        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <JournalCard
                entry={item}
                onPress={() => navigation.navigate('JournalDetail', { entryId: item.id })}
              />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={COLORS.disabled} />
              <Text style={styles.emptyTitle}>
                {hasActiveFilters ? 'No matching reflections found' : 'No reflections recorded yet'}
              </Text>
              <Text style={styles.emptySub}>
                {hasActiveFilters
                  ? 'Try adjusting your search terms or clearing filters.'
                  : 'Start journaling to create your history!'}
              </Text>
              {hasActiveFilters ? (
                <TouchableOpacity style={styles.resetBtn} onPress={handleClearFilters}>
                  <Text style={styles.resetBtnText}>Reset All Filters</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          }
        />

        {/* Confirmation Modal for Deletion */}
        <Modal
          visible={Boolean(entryToDelete)}
          transparent
          animationType="fade"
          onRequestClose={() => setEntryToDelete(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Ionicons name="warning-outline" size={40} color={COLORS.danger} />
              <Text style={styles.modalTitle}>Delete Journal Entry?</Text>
              <Text style={styles.modalBody}>
                Are you sure you want to permanently delete this journal entry and its attached photo? This action cannot be undone.
              </Text>
              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.cancelModalBtn}
                  onPress={() => setEntryToDelete(null)}
                >
                  <Text style={styles.cancelModalText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteModalBtn}
                  onPress={confirmDelete}
                >
                  <Text style={styles.deleteModalText}>Delete</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  clearBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.danger,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.xs,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  filterStrip: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
  },
  moodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  moodPillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  moodEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  moodPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  moodPillTextSelected: {
    color: '#FFFFFF',
  },
  tagFilterSection: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  cardWrapper: {
    marginBottom: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
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
  },
  resetBtn: {
    marginTop: SPACING.md,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
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
