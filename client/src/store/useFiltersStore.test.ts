import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFiltersStore } from './useFiltersStore';
import type { AdsFilters } from '@/types';

describe('useFiltersStore', () => {
  const mockFilters: AdsFilters = {
    status: ['pending'],
    categoryId: 1,
    minPrice: 1000,
    maxPrice: 5000,
    search: 'test',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  };

  beforeEach(() => {
    localStorage.clear();
    // Reset store by clearing all filters
    const store = useFiltersStore.getState();
    store.savedFilters.forEach((filter) => {
      store.removeFilter(filter.id);
    });
  });

  it('has empty saved filters by default', () => {
    const { result } = renderHook(() => useFiltersStore());
    expect(result.current.savedFilters).toEqual([]);
  });

  it('saves a filter', () => {
    const { result } = renderHook(() => useFiltersStore());

    act(() => {
      result.current.saveFilter('My Filter', mockFilters);
    });

    expect(result.current.savedFilters).toHaveLength(1);
    expect(result.current.savedFilters[0].name).toBe('My Filter');
    expect(result.current.savedFilters[0].filters).toEqual(mockFilters);
  });

  it('saves multiple filters', () => {
    const { result } = renderHook(() => useFiltersStore());

    act(() => {
      result.current.saveFilter('Filter 1', mockFilters);
      result.current.saveFilter('Filter 2', { ...mockFilters, categoryId: 2 });
    });

    expect(result.current.savedFilters).toHaveLength(2);
    expect(result.current.savedFilters[0].name).toBe('Filter 1');
    expect(result.current.savedFilters[1].name).toBe('Filter 2');
  });

  it('generates unique IDs for filters', async () => {
    const { result } = renderHook(() => useFiltersStore());

    act(() => {
      result.current.saveFilter('Filter 1', mockFilters);
    });

    // Wait a bit to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    act(() => {
      result.current.saveFilter('Filter 2', mockFilters);
    });

    const ids = result.current.savedFilters.map((f) => f.id);
    expect(new Set(ids).size).toBe(2);
  });

  it('removes a filter by ID', () => {
    const { result } = renderHook(() => useFiltersStore());

    act(() => {
      result.current.saveFilter('My Filter', mockFilters);
    });

    expect(result.current.savedFilters).toHaveLength(1);
    
    const filterId = result.current.savedFilters[0].id;

    act(() => {
      result.current.removeFilter(filterId);
    });

    expect(result.current.savedFilters).toHaveLength(0);
  });

  it('gets saved filter by ID', () => {
    const { result } = renderHook(() => useFiltersStore());

    act(() => {
      result.current.saveFilter('My Filter', mockFilters);
    });

    const filterId = result.current.savedFilters[0].id;
    const filter = result.current.getSavedFilter(filterId);

    expect(filter).toBeDefined();
    expect(filter?.name).toBe('My Filter');
    expect(filter?.filters).toEqual(mockFilters);
  });

  it('returns undefined for non-existent filter ID', () => {
    const { result } = renderHook(() => useFiltersStore());

    const filter = result.current.getSavedFilter('non-existent-id');

    expect(filter).toBeUndefined();
  });

  it('updates a filter', () => {
    const { result } = renderHook(() => useFiltersStore());

    act(() => {
      result.current.saveFilter('Original Name', mockFilters);
    });

    const filterId = result.current.savedFilters[0].id;

    const updatedFilters: AdsFilters = {
      ...mockFilters,
      categoryId: 2,
    };

    act(() => {
      result.current.updateFilter(filterId, 'Updated Name', updatedFilters);
    });

    const updatedFilter = result.current.getSavedFilter(filterId);

    expect(updatedFilter?.name).toBe('Updated Name');
    expect(updatedFilter?.filters.categoryId).toBe(2);
  });

  it('sets createdAt timestamp when saving', () => {
    const { result } = renderHook(() => useFiltersStore());

    const now = Date.now();

    act(() => {
      result.current.saveFilter('My Filter', mockFilters);
    });

    const filter = result.current.savedFilters[0];
    expect(filter.createdAt).toBeGreaterThanOrEqual(now);
  });

  it('updates createdAt when updating filter', async () => {
    const { result } = renderHook(() => useFiltersStore());

    act(() => {
      result.current.saveFilter('My Filter', mockFilters);
    });

    const filterId = result.current.savedFilters[0].id;
    const originalCreatedAt = result.current.savedFilters[0].createdAt;

    // Wait a bit to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    act(() => {
      result.current.updateFilter(filterId, 'Updated', mockFilters);
    });

    const updatedFilter = result.current.getSavedFilter(filterId);
    expect(updatedFilter?.createdAt).toBeGreaterThanOrEqual(originalCreatedAt);
  });

  it('does not update non-existent filter', () => {
    const { result } = renderHook(() => useFiltersStore());

    act(() => {
      result.current.saveFilter('Filter 1', mockFilters);
    });

    const lengthBefore = result.current.savedFilters.length;

    act(() => {
      result.current.updateFilter('non-existent-id', 'Updated', mockFilters);
    });

    expect(result.current.savedFilters).toHaveLength(lengthBefore);
    expect(result.current.savedFilters[0].name).toBe('Filter 1');
  });

  it('maintains filter order', () => {
    const { result } = renderHook(() => useFiltersStore());

    act(() => {
      result.current.saveFilter('Filter 1', mockFilters);
      result.current.saveFilter('Filter 2', mockFilters);
      result.current.saveFilter('Filter 3', mockFilters);
    });

    expect(result.current.savedFilters[0].name).toBe('Filter 1');
    expect(result.current.savedFilters[1].name).toBe('Filter 2');
    expect(result.current.savedFilters[2].name).toBe('Filter 3');
  });
});

