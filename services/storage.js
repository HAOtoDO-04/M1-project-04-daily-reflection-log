import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@mydaily_journal_entries';

const getInitialSeedEntries = () => {
  const now = new Date();

  const today = new Date(now);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(now.getDate() - 2);
  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(now.getDate() - 3);

  const formatDateStr = (d) => d.toISOString().split('T')[0];

  return [
    {
      id: 'entry_seed_1',
      createdAt: today.toISOString(),
      updatedAt: today.toISOString(),
      date: formatDateStr(today),
      text: 'Had a wonderfully productive morning working on my mobile app projects! Took a refreshing walk in the afternoon sun, enjoyed a nice cup of matcha latte, and felt accomplished ending the day with good energy.',
      mood: '😊',
      moodIntensity: 5,
      photoUri: null,
      tags: ['Hobbies', 'Other'],
      weather: { temp: 26, condition: 'Partly Cloudy', icon: '⛅', location: 'Kuala Lumpur' },
    },
    {
      id: 'entry_seed_2',
      createdAt: yesterday.toISOString(),
      updatedAt: yesterday.toISOString(),
      date: formatDateStr(yesterday),
      text: 'Reconnected with close friends over dinner tonight. We laughed reminiscing about old memories and caught up on everyone\'s latest life milestones. Feeling deeply grateful for long-lasting friendships.',
      mood: '🥳',
      moodIntensity: 4,
      photoUri: null,
      tags: ['Friends', 'Family'],
      weather: { temp: 28, condition: 'Clear Sky', icon: '☀️', location: 'Kuala Lumpur' },
    },
    {
      id: 'entry_seed_3',
      createdAt: twoDaysAgo.toISOString(),
      updatedAt: twoDaysAgo.toISOString(),
      date: formatDateStr(twoDaysAgo),
      text: 'A quiet and peaceful afternoon reading an inspiring book. Spent time decluttering my desk workspace and planning out my key priorities for the week ahead.',
      mood: '😌',
      moodIntensity: 4,
      photoUri: null,
      tags: ['Hobbies', 'School'],
      weather: { temp: 24, condition: 'Light Rain', icon: '🌧️', location: 'Kuala Lumpur' },
    },
    {
      id: 'entry_seed_4',
      createdAt: threeDaysAgo.toISOString(),
      updatedAt: threeDaysAgo.toISOString(),
      date: formatDateStr(threeDaysAgo),
      text: 'Felt a bit tired after a long day of focused study sessions. Remembered to take regular breaks, stay hydrated, and practice mindful breathing exercises in the evening.',
      mood: '😐',
      moodIntensity: 3,
      photoUri: null,
      tags: ['School'],
      weather: { temp: 25, condition: 'Overcast', icon: '☁️', location: 'Kuala Lumpur' },
    },
  ];
};

/**
 * Retrieve all journal entries sorted in reverse chronological order (newest first).
 */
export const getAllEntries = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (!jsonValue) {
      const initialSeed = getInitialSeedEntries();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialSeed));
      return initialSeed;
    }
    const entries = JSON.parse(jsonValue);
    if (!entries || entries.length === 0) {
      const initialSeed = getInitialSeedEntries();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialSeed));
      return initialSeed;
    }
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
