// HHGTG-inspired theme for Resolution Tracker
// "Don't Panic" - friendly, cosmic, slightly absurd

export const colors = {
  // Primary palette - inspired by the Guide's friendly green letters
  primary: '#42B883', // A friendly green, also references "42"
  primaryDark: '#2E8B57',
  primaryLight: '#7DCEA0',

  // Background - deep space feel
  background: '#1A1A2E', // Deep space blue-black
  surface: '#252542', // Slightly lighter surface
  surfaceLight: '#2F2F4A', // Cards, elevated surfaces

  // Text
  textPrimary: '#E8E8E8', // Almost white
  textSecondary: '#A0A0B0', // Muted
  textMuted: '#6B6B7B', // Very muted

  // Accent colors
  accent: '#F4D03F', // Babel fish yellow
  warning: '#E74C3C', // Vogon red
  success: '#27AE60', // Completed green

  // Status colors for resolutions
  notStarted: '#6B6B7B',
  inProgress: '#F4D03F',
  complete: '#27AE60',

  // Confetti colors
  confetti: ['#42B883', '#F4D03F', '#E74C3C', '#3498DB', '#9B59B6', '#1ABC9C'],
};

export const fonts = {
  // Sizes
  tiny: 12,
  small: 14,
  medium: 16,
  large: 20,
  xlarge: 24,
  title: 32,

  // Weights (as strings for React Native)
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  round: 9999,
};

// Fun HHGTG-inspired placeholder texts
export const placeholders = {
  whatsNext: "What's the next small step? (Don't Panic)",
  resolutionTitle: 'e.g., Learn to fly by throwing yourself at the ground and missing',
  resolutionDescription: 'Describe your resolution... or just write "42"',
  milestoneTitle: 'e.g., Find a really good towel',
  journalEntry: "How's it going? Any improbable developments?",
};

// Fun empty state messages
export const emptyStates = {
  noResolutions: [
    "No resolutions yet. The universe is still young.",
    "Your resolution list is as empty as the space between galaxies.",
    "Nothing here. Perhaps start with 'Don't Panic'?",
    "42 resolutions would be ideal, but zero works too.",
  ],
  noMilestones: "No milestones yet. Every journey starts with a single towel.",
  noJournalEntries: "No journal entries. The story hasn't been written yet.",
};

// Get a random empty state message
export function getRandomEmptyMessage(key: keyof typeof emptyStates): string {
  const messages = emptyStates[key];
  if (Array.isArray(messages)) {
    return messages[Math.floor(Math.random() * messages.length)];
  }
  return messages;
}
