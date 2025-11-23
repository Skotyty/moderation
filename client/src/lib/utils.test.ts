import { describe, it, expect, vi } from 'vitest';
import {
  cn,
  formatPrice,
  formatDate,
  formatDateTime,
  getStatusLabel,
  getStatusColor,
  getPriorityLabel,
  getPriorityColor,
  debounce,
  formatTime,
} from './utils';

describe('Utils', () => {
  describe('cn', () => {
    it('merges class names', () => {
      const result = cn('foo', 'bar');
      expect(result).toContain('foo');
      expect(result).toContain('bar');
    });

    it('handles conditional classes', () => {
      const result = cn('foo', false && 'bar', 'baz');
      expect(result).toContain('foo');
      expect(result).toContain('baz');
      expect(result).not.toContain('bar');
    });

    it('merges Tailwind classes correctly', () => {
      const result = cn('px-2', 'px-4');
      expect(result).toBe('px-4');
    });
  });

  describe('formatPrice', () => {
    it('formats price correctly', () => {
      const result = formatPrice(1000);
      expect(result).toContain('1');
      expect(result).toContain('000');
      expect(result).toContain('₽');
    });

    it('formats large numbers with spaces', () => {
      const result = formatPrice(1000000);
      expect(result).toMatch(/1[\s\u00A0]000[\s\u00A0]000/);
    });

    it('formats zero', () => {
      const result = formatPrice(0);
      expect(result).toContain('0');
      expect(result).toContain('₽');
    });

    it('formats negative numbers', () => {
      const result = formatPrice(-500);
      expect(result).toContain('-');
      expect(result).toContain('500');
    });
  });

  describe('formatDate', () => {
    it('formats date string correctly', () => {
      const date = '2024-01-15';
      const formatted = formatDate(date);
      expect(formatted).toBeTruthy();
      expect(formatted).toContain('2024');
    });

    it('formats Date object correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toBeTruthy();
      expect(formatted).toContain('2024');
    });

    it('includes month name', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/январ/i);
    });
  });

  describe('formatDateTime', () => {
    it('formats datetime with time', () => {
      const date = new Date('2024-01-15T10:30:00');
      const formatted = formatDateTime(date);
      expect(formatted).toContain('2024');
      expect(formatted).toContain('10:30');
    });

    it('includes month name', () => {
      const date = new Date('2024-01-15T10:30:00');
      const formatted = formatDateTime(date);
      expect(formatted).toMatch(/январ/i);
    });
  });

  describe('getStatusLabel', () => {
    it('returns correct label for pending', () => {
      expect(getStatusLabel('pending')).toBe('На модерации');
    });

    it('returns correct label for approved', () => {
      expect(getStatusLabel('approved')).toBe('Одобрено');
    });

    it('returns correct label for rejected', () => {
      expect(getStatusLabel('rejected')).toBe('Отклонено');
    });

    it('returns correct label for draft', () => {
      expect(getStatusLabel('draft')).toBe('Черновик');
    });

    it('returns original status for unknown status', () => {
      expect(getStatusLabel('unknown')).toBe('unknown');
    });
  });

  describe('getStatusColor', () => {
    it('returns correct color for pending', () => {
      const color = getStatusColor('pending');
      expect(color).toContain('yellow');
    });

    it('returns correct color for approved', () => {
      const color = getStatusColor('approved');
      expect(color).toContain('green');
    });

    it('returns correct color for rejected', () => {
      const color = getStatusColor('rejected');
      expect(color).toContain('red');
    });

    it('returns correct color for draft', () => {
      const color = getStatusColor('draft');
      expect(color).toContain('gray');
    });

    it('returns default color for unknown status', () => {
      const color = getStatusColor('unknown');
      expect(color).toContain('gray');
    });
  });

  describe('getPriorityLabel', () => {
    it('returns correct label for normal', () => {
      expect(getPriorityLabel('normal')).toBe('Обычный');
    });

    it('returns correct label for urgent', () => {
      expect(getPriorityLabel('urgent')).toBe('Срочное');
    });

    it('returns original priority for unknown priority', () => {
      expect(getPriorityLabel('unknown')).toBe('unknown');
    });
  });

  describe('getPriorityColor', () => {
    it('returns correct color for normal', () => {
      const color = getPriorityColor('normal');
      expect(color).toContain('blue');
    });

    it('returns correct color for urgent', () => {
      const color = getPriorityColor('urgent');
      expect(color).toContain('red');
    });

    it('returns default color for unknown priority', () => {
      const color = getPriorityColor('unknown');
      expect(color).toContain('blue');
    });
  });

  describe('debounce', () => {
    it('delays function execution', async () => {
      vi.useFakeTimers();
      const func = vi.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc();
      expect(func).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(func).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it('cancels previous calls', async () => {
      vi.useFakeTimers();
      const func = vi.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc();
      debouncedFunc();
      debouncedFunc();

      vi.advanceTimersByTime(100);
      expect(func).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it('passes arguments correctly', async () => {
      vi.useFakeTimers();
      const func = vi.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc('arg1', 'arg2');

      vi.advanceTimersByTime(100);
      expect(func).toHaveBeenCalledWith('arg1', 'arg2');

      vi.useRealTimers();
    });
  });

  describe('formatTime', () => {
    it('formats seconds', () => {
      expect(formatTime(30)).toBe('30 сек');
    });

    it('formats minutes', () => {
      expect(formatTime(60)).toBe('1 мин');
      expect(formatTime(120)).toBe('2 мин');
    });

    it('formats large numbers', () => {
      expect(formatTime(300)).toBe('5 мин');
      expect(formatTime(3600)).toBe('60 мин');
    });

    it('formats zero', () => {
      expect(formatTime(0)).toBe('0 сек');
    });
  });
});



