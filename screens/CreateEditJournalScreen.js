import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { saveEntry, getEntryById } from '../services/storage';
import { fetchCurrentWeather } from '../services/weather';
import MoodPicker from '../components/MoodPicker';
import PhotoPicker from '../components/PhotoPicker';
import TagSelector from '../components/TagSelector';
import { COLORS, SPACING, SHADOWS } from '../style';

export default function CreateEditJournalScreen({ route, navigation }) {
  const entryId = route.params?.entryId;
  const isEditing = Boolean(entryId);

  const [text, setText] = useState('');
  const [mood, setMood] = useState('😊');
  const [moodIntensity, setMoodIntensity] = useState(3);
  const [photoUri, setPhotoUri] = useState(null);
  const [tags, setTags] = useState([]);
  const [weatherSnapshot, setWeatherSnapshot] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadExistingEntry();
    } else {
      // Auto capture current weather snapshot for new entries
      loadWeatherSnapshot();
    }
  }, [entryId]);

  const loadExistingEntry = async () => {
    const entry = await getEntryById(entryId);
    if (entry) {
      setText(entry.text || '');
      setMood(entry.mood || '😊');
      setMoodIntensity(entry.moodIntensity || 3);
      setPhotoUri(entry.photoUri || null);
      setTags(entry.tags || []);
      setWeatherSnapshot(entry.weather || null);
    } else {
      Alert.alert('Error', 'Journal entry not found.');
      navigation.goBack();
    }
  };

  const loadWeatherSnapshot = async () => {
    const result = await fetchCurrentWeather();
    if (result.success) {
      setWeatherSnapshot(result.data);
    }
  };

  const handleToggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleSave = async () => {
    if (!text.trim()) {
      Alert.alert('Validation Error', 'Please write a short note about your day.');
      return;
    }
    if (!mood) {
      Alert.alert('Validation Error', 'Please select your mood emoji.');
      return;
    }

    setSaving(true);

    const payload = {
      id: entryId,
      text,
      mood,
      moodIntensity,
      photoUri,
      tags,
      weather: weatherSnapshot,
    };

    const result = await saveEntry(payload);
    setSaving(false);

    if (result.success) {
      Alert.alert(
        'Success',
        isEditing ? 'Journal entry updated successfully!' : 'Journal entry saved successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert('Error Saving', result.error || 'Failed to save entry. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Navigates to previous screen"
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text
            style={styles.headerTitle}
            accessible={true}
            accessibilityRole="header"
          >
            {isEditing ? 'Edit Reflection' : 'New Reflection'}
          </Text>
          <TouchableOpacity
            style={[styles.saveHeaderBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel={isEditing ? 'Save changes to reflection' : 'Save new reflection'}
            accessibilityState={{ disabled: saving }}
          >
            <Text style={styles.saveHeaderBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Weather Snapshot Header */}
          {weatherSnapshot ? (
            <View style={styles.weatherHeaderBadge}>
              <Text style={styles.weatherHeaderText}>
                📍 Weather: {weatherSnapshot.icon} {weatherSnapshot.temp}°C {weatherSnapshot.condition} ({weatherSnapshot.location})
              </Text>
            </View>
          ) : null}

          {/* Mood Selection */}
          <MoodPicker
            selectedMood={mood}
            onSelectMood={setMood}
            intensity={moodIntensity}
            onSelectIntensity={setMoodIntensity}
          />

          {/* Main Journal Note Text Input */}
          <View style={styles.textInputCard}>
            <Text style={styles.inputLabel}>Your Journal Entry</Text>
            <TextInput
              style={styles.textInput}
              placeholder="What happened today? How are you feeling, and what did you learn?"
              placeholderTextColor={COLORS.textSecondary}
              multiline
              textAlignVertical="top"
              value={text}
              onChangeText={setText}
              accessibilityLabel="Journal entry text input"
              accessibilityHint="Type your daily reflection note here"
            />
          </View>

          {/* Optional Photo Attachment */}
          <PhotoPicker
            photoUri={photoUri}
            onSelectPhoto={setPhotoUri}
            onRemovePhoto={() => setPhotoUri(null)}
          />

          {/* Optional Tags Selection */}
          <View style={styles.tagCard}>
            <TagSelector
              selectedTags={tags}
              onToggleTag={handleToggleTag}
              label="Add Tags to categorize"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.bottomSaveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel={saving ? 'Saving reflection' : isEditing ? 'Update Journal Entry' : 'Save Journal Entry'}
            accessibilityState={{ disabled: saving }}
          >
            <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />
            <Text style={styles.bottomSaveBtnText}>
              {saving ? 'Saving Reflection...' : isEditing ? 'Update Journal Entry' : 'Save Journal Entry'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  saveHeaderBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveHeaderBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  weatherHeaderBadge: {
    backgroundColor: '#F0F7F4',
    padding: SPACING.sm,
    borderRadius: 12,
    marginBottom: SPACING.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8E2DC',
  },
  weatherHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  textInputCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  textInput: {
    minHeight: 140,
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  tagCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  bottomSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 16,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    ...SHADOWS.medium,
  },
  bottomSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});
