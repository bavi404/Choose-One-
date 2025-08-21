/**
 * Application constants and configuration
 */

// Choice limits
export const MIN_CHOICES = 2;
export const MAX_CHOICES = 500;
export const MAX_CHARS = 120;

// Animation settings
export const ANIMATION_SPEEDS = {
  FAST: { duration: 1500, interval: 50, label: 'Fast' },
  MEDIUM: { duration: 3000, interval: 100, label: 'Medium' },
  SLOW: { duration: 5000, interval: 200, label: 'Slow' }
};

export const DEFAULT_ANIMATION_SPEED = 'MEDIUM';

// Selection settings
export const MIN_MULTI_PICK = 1;
export const MAX_MULTI_PICK = 3;
export const DEFAULT_MULTI_PICK = 1;

// UI thresholds
export const LARGE_CHOICE_THRESHOLD = 30;
export const INPUT_DEBOUNCE_MS = 200;

// Storage keys
export const STORAGE_KEYS = {
  RECENT_CHOICE_SETS: 'app:recentChoiceSets',
  THEME: 'app:theme',
  LAST_SETTINGS: 'app:lastSettings'
};

// Default weights
export const DEFAULT_WEIGHT = 1;
export const MIN_WEIGHT = 0.1;
export const MAX_WEIGHT = 10;

// Recent choices settings
export const MAX_RECENT_SETS = 10;
export const MAX_RECENT_AGE_DAYS = 30;
