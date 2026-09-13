export const COLORS = {
  primary: '#3A5A40',       // Calming Forest Sage
  primaryLight: '#588157',  // Muted Sage Accent
  primaryDark: '#283618',   // Deep Forest
  accent: '#E9C46A',        // Warm Amber Gold
  background: '#F7F9F6',    // Soft Off-White
  cardBg: '#FFFFFF',        // Pure White Card
  textPrimary: '#1F2421',   // Deep Dark Charcoal
  textSecondary: '#6C757D', // Muted Slate Grey
  border: '#E2E8F0',        // Subtle Divider Line
  danger: '#E63946',        // Soft Crimson
  success: '#4A7C59',       // Leaf Green
  disabled: '#CBD5E1',      // Inactive Grey
  
  // Mood Specific Colors
  moods: {
    '😊': { label: 'Happy', color: '#FFF3B0', text: '#B5838D', border: '#F4A261' },
    '😐': { label: 'Neutral', color: '#E0F2FE', text: '#0369A1', border: '#7DD3FC' },
    '😔': { label: 'Sad', color: '#E0E7FF', text: '#4338CA', border: '#A5B4FC' },
    '😤': { label: 'Angry', color: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5' },
    '😴': { label: 'Tired', color: '#F3E8FF', text: '#6B21A8', border: '#D8B4FE' },
  }
};

export const MOODS = [
  { emoji: '😊', label: 'Happy', id: 'happy' },
  { emoji: '😐', label: 'Neutral', id: 'neutral' },
  { emoji: '😔', label: 'Sad', id: 'sad' },
  { emoji: '😤', label: 'Angry', id: 'angry' },
  { emoji: '😴', label: 'Tired', id: 'tired' },
];

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
};
