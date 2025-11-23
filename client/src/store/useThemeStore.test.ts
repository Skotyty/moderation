import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useThemeStore } from './useThemeStore';

describe('useThemeStore', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('has default light theme', () => {
    const { result } = renderHook(() => useThemeStore());
    expect(result.current.theme).toBe('light');
  });

  it('toggles theme from light to dark', () => {
    const { result } = renderHook(() => useThemeStore());

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles theme from dark to light', () => {
    const { result } = renderHook(() => useThemeStore());

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('sets theme to dark', () => {
    const { result } = renderHook(() => useThemeStore());

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('sets theme to light', () => {
    const { result } = renderHook(() => useThemeStore());

    act(() => {
      result.current.setTheme('dark');
    });

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('applies dark class to document element when theme is dark', () => {
    const { result } = renderHook(() => useThemeStore());

    act(() => {
      result.current.setTheme('dark');
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes dark class from document element when theme is light', () => {
    const { result } = renderHook(() => useThemeStore());

    act(() => {
      result.current.setTheme('dark');
    });

    act(() => {
      result.current.setTheme('light');
    });

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggles multiple times correctly', () => {
    const { result } = renderHook(() => useThemeStore());

    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('dark');

    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('light');

    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('dark');
  });
});



