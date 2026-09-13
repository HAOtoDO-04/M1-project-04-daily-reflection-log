/**
 * Calculate current streak and longest streak from list of journal entries.
 * Dates are expected in YYYY-MM-DD format or ISO strings.
 */
export const calculateStreaks = (entries = []) => {
  if (!entries || entries.length === 0) {
    return { currentStreak: 0, longestStreak: 0, entryDates: [] };
  }

  // Extract unique sorted dates (newest to oldest) in local YYYY-MM-DD
  const dateSet = new Set();
  entries.forEach((entry) => {
    if (entry.createdAt) {
      const d = new Date(entry.createdAt);
      const localDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dateSet.add(localDateStr);
    } else if (entry.date) {
      dateSet.add(entry.date);
    }
  });

  const sortedDates = Array.from(dateSet).sort((a, b) => new Date(b) - new Date(a));

  if (sortedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, entryDates: [] };
  }

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  let currentStreak = 0;
  let maxStreak = 0;

  // Calculate current active streak starting from today or yesterday
  let checkDate = new Date();

  // If user hasn't journaled today, check if streak is alive from yesterday
  if (!dateSet.has(todayStr)) {
    if (dateSet.has(yesterdayStr)) {
      checkDate = yesterday;
    } else {
      // Streak broken
      checkDate = null;
    }
  }

  if (checkDate) {
    let activeDate = new Date(checkDate);
    while (true) {
      const dateStr = `${activeDate.getFullYear()}-${String(activeDate.getMonth() + 1).padStart(2, '0')}-${String(activeDate.getDate()).padStart(2, '0')}`;
      if (dateSet.has(dateStr)) {
        currentStreak++;
        activeDate.setDate(activeDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak across all recorded entries
  let tempStreak = 0;
  // Convert sorted dates to Date objects ascending
  const ascDates = sortedDates.map(d => new Date(d)).sort((a, b) => a - b);
  
  for (let i = 0; i < ascDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = ascDates[i - 1];
      const curr = ascDates[i];
      const diffTime = Math.abs(curr - prev);
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > maxStreak) {
      maxStreak = tempStreak;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(currentStreak, maxStreak),
    entryDates: Array.from(dateSet),
  };
};
