/**
 * Utility functions for the choice picker application
 */

import { MAX_CHARS, DEFAULT_WEIGHT, MIN_WEIGHT, MAX_WEIGHT } from './constants.js';

/**
 * Sanitizes text input to prevent XSS and handle special characters
 * @param {string} text - The text to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized text
 */
export function sanitizeText(text, maxLength = MAX_CHARS) {
  if (typeof text !== 'string') return '';
  
  // Remove HTML tags and dangerous characters
  const sanitized = text
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/&/g, '&amp;') // Escape ampersands
    .trim();
  
  // Truncate if too long
  if (sanitized.length > maxLength) {
    return sanitized.substring(0, maxLength - 3) + '...';
  }
  
  return sanitized;
}

/**
 * Debounces a function call
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Generates a random number between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Performs weighted random selection
 * @param {Array} items - Array of items with weights
 * @param {Array} weights - Array of weights corresponding to items
 * @returns {any} Selected item
 */
export function weightedRandomSelect(items, weights) {
  if (!items || !weights || items.length !== weights.length) {
    throw new Error('Items and weights arrays must have the same length');
  }
  
  if (items.length === 0) {
    throw new Error('Cannot select from empty array');
  }
  
  // Calculate total weight
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  
  if (totalWeight <= 0) {
    throw new Error('Total weight must be positive');
  }
  
  // Generate random value
  const random = Math.random() * totalWeight;
  
  // Find the item based on cumulative weight
  let cumulativeWeight = 0;
  for (let i = 0; i < items.length; i++) {
    cumulativeWeight += weights[i];
    if (random <= cumulativeWeight) {
      return items[i];
    }
  }
  
  // Fallback to last item (shouldn't happen with proper math)
  return items[items.length - 1];
}

/**
 * Detects duplicate choices (case-insensitive, trimmed)
 * @param {Array} choices - Array of choice strings
 * @returns {Object} Object with duplicates array and hasDuplicates boolean
 */
export function detectDuplicates(choices) {
  const normalized = choices.map(choice => choice.toLowerCase().trim());
  const seen = new Set();
  const duplicates = [];
  
  normalized.forEach((choice, index) => {
    if (seen.has(choice)) {
      duplicates.push(index);
    } else {
      seen.add(choice);
    }
  });
  
  return {
    hasDuplicates: duplicates.length > 0,
    duplicates: duplicates
  };
}

/**
 * Validates choice count and content
 * @param {Array} choices - Array of choice strings
 * @returns {Object} Validation result with isValid boolean and errors array
 */
export function validateChoices(choices) {
  const errors = [];
  
  if (!Array.isArray(choices)) {
    errors.push('Choices must be an array');
    return { isValid: false, errors };
  }
  
  if (choices.length < 2) {
    errors.push(`At least 2 choices are required (got ${choices.length})`);
  }
  
  if (choices.length > 500) {
    errors.push(`Maximum 500 choices allowed (got ${choices.length})`);
  }
  
  // Check for empty choices
  const emptyChoices = choices.some(choice => !choice || choice.trim() === '');
  if (emptyChoices) {
    errors.push('All choices must have content');
  }
  
  // Check for duplicates
  const { hasDuplicates, duplicates } = detectDuplicates(choices);
  if (hasDuplicates) {
    errors.push(`Duplicate choices detected at positions: ${duplicates.map(i => i + 1).join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generates a unique ID for choice sets
 * @returns {string} Unique ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Formats timestamp for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatTimestamp(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}
