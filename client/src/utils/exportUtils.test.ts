import { describe, it, expect } from 'vitest';
import { formatPrice, formatDate, getStatusLabel } from '@/lib/utils';

describe('Utils', () => {
  describe('formatPrice', () => {
    it('should format price correctly', () => {
      expect(formatPrice(1000)).toContain('1');
      expect(formatPrice(1000)).toContain('000');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toBeTruthy();
    });
  });

  describe('getStatusLabel', () => {
    it('should return correct label for pending', () => {
      expect(getStatusLabel('pending')).toBe('На модерации');
    });

    it('should return correct label for approved', () => {
      expect(getStatusLabel('approved')).toBe('Одобрено');
    });

    it('should return correct label for rejected', () => {
      expect(getStatusLabel('rejected')).toBe('Отклонено');
    });
  });
});







