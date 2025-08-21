/**
 * Unit tests for utility functions
 */

import { 
  sanitizeText, 
  debounce, 
  randomInt, 
  weightedRandomSelect, 
  detectDuplicates, 
  validateChoices,
  generateId,
  formatTimestamp
} from '../utils.js';

// Mock DOM environment for tests
global.window = {};
global.document = {};

describe('Utility Functions', () => {
  describe('sanitizeText', () => {
    test('should sanitize HTML tags', () => {
      expect(sanitizeText('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
    });

    test('should escape ampersands', () => {
      expect(sanitizeText('A & B')).toBe('A &amp; B');
    });

    test('should truncate long text', () => {
      const longText = 'a'.repeat(150);
      expect(sanitizeText(longText).length).toBeLessThanOrEqual(120);
      expect(sanitizeText(longText).endsWith('...')).toBe(true);
    });

    test('should handle empty input', () => {
      expect(sanitizeText('')).toBe('');
      expect(sanitizeText(null)).toBe('');
      expect(sanitizeText(undefined)).toBe('');
    });
  });

  describe('debounce', () => {
    test('should debounce function calls', (done) => {
      let callCount = 0;
      const debouncedFn = debounce(() => { callCount++; }, 100);
      
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      expect(callCount).toBe(0);
      
      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 150);
    });
  });

  describe('randomInt', () => {
    test('should generate random integers within range', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomInt(1, 10);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(10);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    test('should handle single value range', () => {
      expect(randomInt(5, 5)).toBe(5);
    });
  });

  describe('weightedRandomSelect', () => {
    test('should select items based on weights', () => {
      const items = ['A', 'B', 'C'];
      const weights = [1, 2, 3];
      
      // Test multiple times to ensure weighted distribution
      const results = [];
      for (let i = 0; i < 1000; i++) {
        results.push(weightedRandomSelect(items, weights));
      }
      
      // C should appear more often than A
      const countA = results.filter(r => r === 'A').length;
      const countC = results.filter(r => r === 'C').length;
      expect(countC).toBeGreaterThan(countA);
    });

    test('should throw error for mismatched arrays', () => {
      expect(() => weightedRandomSelect(['A', 'B'], [1])).toThrow();
    });

    test('should throw error for empty array', () => {
      expect(() => weightedRandomSelect([], [])).toThrow();
    });
  });

  describe('detectDuplicates', () => {
    test('should detect case-insensitive duplicates', () => {
      const choices = ['Apple', 'apple', 'Banana', 'BANANA'];
      const result = detectDuplicates(choices);
      
      expect(result.hasDuplicates).toBe(true);
      expect(result.duplicates).toContain(1); // 'apple'
      expect(result.duplicates).toContain(3); // 'BANANA'
    });

    test('should handle trimmed whitespace', () => {
      const choices = ['Apple', ' Apple ', 'Banana'];
      const result = detectDuplicates(choices);
      
      expect(result.hasDuplicates).toBe(true);
      expect(result.duplicates).toContain(1);
    });

    test('should return no duplicates for unique choices', () => {
      const choices = ['Apple', 'Banana', 'Cherry'];
      const result = detectDuplicates(choices);
      
      expect(result.hasDuplicates).toBe(false);
      expect(result.duplicates).toHaveLength(0);
    });
  });

  describe('validateChoices', () => {
    test('should validate minimum choices', () => {
      const result = validateChoices(['Apple']);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least 2 choices are required (got 1)');
    });

    test('should validate maximum choices', () => {
      const manyChoices = Array.from({ length: 501 }, (_, i) => `Choice ${i}`);
      const result = validateChoices(manyChoices);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Maximum 500 choices allowed (got 501)');
    });

    test('should detect empty choices', () => {
      const result = validateChoices(['Apple', '', 'Banana']);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('All choices must have content');
    });

    test('should validate good choices', () => {
      const result = validateChoices(['Apple', 'Banana', 'Cherry']);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('generateId', () => {
    test('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });
  });

  describe('formatTimestamp', () => {
    test('should format date correctly', () => {
      const date = new Date('2023-12-25T10:30:00');
      const formatted = formatTimestamp(date);
      
      expect(formatted).toMatch(/Dec 25/);
      expect(formatted).toMatch(/10:30/);
    });
  });
});
