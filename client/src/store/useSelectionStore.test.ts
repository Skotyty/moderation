import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSelectionStore } from './useSelectionStore';

describe('useSelectionStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useSelectionStore());
    act(() => {
      result.current.clearSelection();
    });
  });

  it('has empty selection by default', () => {
    const { result } = renderHook(() => useSelectionStore());
    expect(result.current.selectedIds.size).toBe(0);
  });

  it('adds item to selection', () => {
    const { result } = renderHook(() => useSelectionStore());

    act(() => {
      result.current.toggleSelection(1);
    });

    expect(result.current.selectedIds.has(1)).toBe(true);
    expect(result.current.selectedIds.size).toBe(1);
  });

  it('removes item from selection', () => {
    const { result } = renderHook(() => useSelectionStore());

    act(() => {
      result.current.toggleSelection(1);
    });

    expect(result.current.selectedIds.has(1)).toBe(true);

    act(() => {
      result.current.toggleSelection(1);
    });

    expect(result.current.selectedIds.has(1)).toBe(false);
    expect(result.current.selectedIds.size).toBe(0);
  });

  it('toggles multiple items', () => {
    const { result } = renderHook(() => useSelectionStore());

    act(() => {
      result.current.toggleSelection(1);
      result.current.toggleSelection(2);
      result.current.toggleSelection(3);
    });

    expect(result.current.selectedIds.size).toBe(3);
    expect(result.current.selectedIds.has(1)).toBe(true);
    expect(result.current.selectedIds.has(2)).toBe(true);
    expect(result.current.selectedIds.has(3)).toBe(true);
  });

  it('selects all items', () => {
    const { result } = renderHook(() => useSelectionStore());

    const ids = [1, 2, 3, 4, 5];

    act(() => {
      result.current.selectAll(ids);
    });

    expect(result.current.selectedIds.size).toBe(5);
    ids.forEach((id) => {
      expect(result.current.selectedIds.has(id)).toBe(true);
    });
  });

  it('clears selection', () => {
    const { result } = renderHook(() => useSelectionStore());

    act(() => {
      result.current.selectAll([1, 2, 3]);
    });

    expect(result.current.selectedIds.size).toBe(3);

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selectedIds.size).toBe(0);
  });

  it('checks if item is selected', () => {
    const { result } = renderHook(() => useSelectionStore());

    act(() => {
      result.current.toggleSelection(1);
    });

    expect(result.current.isSelected(1)).toBe(true);
    expect(result.current.isSelected(2)).toBe(false);
  });

  it('replaces selection when selectAll is called', () => {
    const { result } = renderHook(() => useSelectionStore());

    act(() => {
      result.current.selectAll([1, 2, 3]);
    });

    expect(result.current.selectedIds.size).toBe(3);

    act(() => {
      result.current.selectAll([4, 5]);
    });

    expect(result.current.selectedIds.size).toBe(2);
    expect(result.current.isSelected(1)).toBe(false);
    expect(result.current.isSelected(4)).toBe(true);
    expect(result.current.isSelected(5)).toBe(true);
  });

  it('handles empty array in selectAll', () => {
    const { result } = renderHook(() => useSelectionStore());

    act(() => {
      result.current.selectAll([1, 2, 3]);
    });

    act(() => {
      result.current.selectAll([]);
    });

    expect(result.current.selectedIds.size).toBe(0);
  });
});


