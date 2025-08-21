/**
 * Storage utilities for the choice picker application
 */

import { STORAGE_KEYS, MAX_RECENT_SETS, MAX_RECENT_AGE_DAYS } from './constants.js';
import { generateId, formatTimestamp } from './utils.js';

/**
 * Saves a recent choice set to localStorage
 * @param {Array} choices - Array of choice strings
 * @param {string} label - Optional label for the choice set
 */
export function saveRecentSet(choices, label = '') {
  try {
    const recentSets = listRecentSets();
    
    const newSet = {
      id: generateId(),
      label: label || `Choices (${choices.length} items)`,
      items: [...choices],
      createdAt: new Date().toISOString()
    };
    
    // Add new set to beginning
    recentSets.unshift(newSet);
    
    // Keep only the most recent sets
    const prunedSets = pruneOldSets(recentSets);
    
    localStorage.setItem(STORAGE_KEYS.RECENT_CHOICE_SETS, JSON.stringify(prunedSets));
    
    return newSet;
  } catch (error) {
    console.error('Failed to save recent choice set:', error);
    return null;
  }
}

/**
 * Lists all recent choice sets from localStorage
 * @returns {Array} Array of recent choice sets
 */
export function listRecentSets() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.RECENT_CHOICE_SETS);
    if (!stored) return [];
    
    const sets = JSON.parse(stored);
    return Array.isArray(sets) ? sets : [];
  } catch (error) {
    console.error('Failed to read recent choice sets:', error);
    return [];
  }
}

/**
 * Restores a specific choice set by ID
 * @param {string} setId - ID of the choice set to restore
 * @returns {Array|null} Array of choices or null if not found
 */
export function restoreSet(setId) {
  try {
    const recentSets = listRecentSets();
    const targetSet = recentSets.find(set => set.id === setId);
    
    if (targetSet) {
      // Move this set to the top (most recent)
      const updatedSets = recentSets.filter(set => set.id !== setId);
      updatedSets.unshift(targetSet);
      
      localStorage.setItem(STORAGE_KEYS.RECENT_CHOICE_SETS, JSON.stringify(updatedSets));
      
      return targetSet.items;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to restore choice set:', error);
    return null;
  }
}

/**
 * Removes old choice sets beyond the maximum age and count
 * @param {Array} sets - Array of choice sets
 * @returns {Array} Pruned array of choice sets
 */
export function pruneOldSets(sets = null) {
  try {
    const currentSets = sets || listRecentSets();
    const now = new Date();
    const maxAgeMs = MAX_RECENT_AGE_DAYS * 24 * 60 * 60 * 1000;
    
    // Filter out old sets and limit count
    const validSets = currentSets
      .filter(set => {
        const createdAt = new Date(set.createdAt);
        return (now - createdAt) < maxAgeMs;
      })
      .slice(0, MAX_RECENT_SETS);
    
    return validSets;
  } catch (error) {
    console.error('Failed to prune old choice sets:', error);
    return [];
  }
}

/**
 * Deletes a specific choice set
 * @param {string} setId - ID of the choice set to delete
 * @returns {boolean} True if deleted successfully
 */
export function deleteSet(setId) {
  try {
    const recentSets = listRecentSets();
    const setExists = recentSets.some(set => set.id === setId);
    
    if (!setExists) {
      return false;
    }
    
    const updatedSets = recentSets.filter(set => set.id !== setId);
    
    localStorage.setItem(STORAGE_KEYS.RECENT_CHOICE_SETS, JSON.stringify(updatedSets));
    
    return true;
  } catch (error) {
    console.error('Failed to delete choice set:', error);
    return false;
  }
}

/**
 * Clears all recent choice sets
 * @returns {boolean} True if cleared successfully
 */
export function clearRecentSets() {
  try {
    localStorage.removeItem(STORAGE_KEYS.RECENT_CHOICE_SETS);
    return true;
  } catch (error) {
    console.error('Failed to clear recent choice sets:', error);
    return false;
  }
}

/**
 * Saves theme preference to localStorage
 * @param {string} theme - Theme name ('default' or 'high-contrast')
 */
export function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (error) {
    console.error('Failed to save theme preference:', error);
  }
}

/**
 * Gets the current theme preference
 * @returns {string} Current theme name
 */
export function getTheme() {
  try {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'default';
  } catch (error) {
    console.error('Failed to get theme preference:', error);
    return 'default';
  }
}

/**
 * Saves user settings to localStorage
 * @param {Object} settings - Settings object
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

/**
 * Gets the last saved user settings
 * @returns {Object} Settings object
 */
export function getSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_SETTINGS);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to get settings:', error);
    return {};
  }
}

/**
 * Formats a choice set for display
 * @param {Object} set - Choice set object
 * @returns {string} Formatted display string
 */
export function formatChoiceSet(set) {
  const timestamp = formatTimestamp(new Date(set.createdAt));
  const itemCount = set.items.length;
  
  if (set.label && set.label !== `Choices (${itemCount} items)`) {
    return `${set.label} (${itemCount} items) - ${timestamp}`;
  }
  
  return `${itemCount} choices - ${timestamp}`;
}
