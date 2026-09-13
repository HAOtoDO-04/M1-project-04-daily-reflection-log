import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@mydaily_journal_entries';

/**
 * Retrieve all journal entries sorted in reverse chronological order (newest first).
 */
export const getAllEntries = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (!jsonValue) return [];
    const entries = JSON.parse(jsonValue);
    // Sort reverse chronological
    return entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return [];
  }
};

/**
 * Get single entry by ID.
 */
export const getEntryById = async (id) => {
  try {
    const entries = await getAllEntries();
    return entries.find((item) => item.id === id) || null;
  } catch (error) {
    console.error('Error getting entry by ID:', error);
    return null;
  }
};

/**
 * Save a new entry or update an existing entry.
 * Validates required fields: text, mood, moodIntensity (1-5).
 */
export const saveEntry = async (entryData) => {
  try {
    const { id, text, mood, moodIntensity, photoUri, tags, weather } = entryData;

    // Validation
    if (!text || !text.trim()) {
      throw new Error('Please write a short note for your day.');
    }
    if (!mood) {
      throw new Error('Please select your mood.');
    }
    if (!moodIntensity || moodIntensity < 1 || moodIntensity > 5) {
      throw new Error('Please set mood intensity between 1 and 5.');
    }

    const entries = await getAllEntries();
    const now = new Date().toISOString();

    let updatedEntries = [];

    if (id) {
      // Update existing entry
      updatedEntries = entries.map((entry) => {
        if (entry.id === id) {
          return {
            ...entry,
            text: text.trim(),
            mood,
            moodIntensity,
            photoUri: photoUri || null,
            tags: tags || [],
            weather: weather || entry.weather || null,
            updatedAt: now,
          };
        }
        return entry;
      });
    } else {
      // Create new entry
      const newEntry = {
        id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
        createdAt: now,
        updatedAt: now,
        date: now.split('T')[0], // YYYY-MM-DD
        text: text.trim(),
        mood,
        moodIntensity,
        photoUri: photoUri || null,
        tags: tags || [],
        weather: weather || null,
      };
      updatedEntries = [newEntry, ...entries];
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    return { success: true, entries: updatedEntries };
  } catch (error) {
    console.error('Error saving journal entry:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete an entry permanently by ID.
 */
export const deleteEntry = async (id) => {
  try {
    const entries = await getAllEntries();
    const filteredEntries = entries.filter((entry) => entry.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEntries));
    return { success: true, entries: filteredEntries };
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return { success: false, error: error.message };
  }
};
