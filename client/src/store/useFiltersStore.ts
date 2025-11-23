import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdsFilters } from '@/types';

export interface SavedFilter {
  id: string;
  name: string;
  filters: AdsFilters;
  createdAt: number;
}

interface FiltersStore {
  savedFilters: SavedFilter[];
  saveFilter: (name: string, filters: AdsFilters) => void;
  removeFilter: (id: string) => void;
  getSavedFilter: (id: string) => SavedFilter | undefined;
  updateFilter: (id: string, name: string, filters: AdsFilters) => void;
}

export const useFiltersStore = create<FiltersStore>()(
  persist(
    (set, get) => ({
      savedFilters: [],
      saveFilter: (name, filters) =>
        set((state) => ({
          savedFilters: [
            ...state.savedFilters,
            {
              id: Date.now().toString(),
              name,
              filters,
              createdAt: Date.now(),
            },
          ],
        })),
      removeFilter: (id) =>
        set((state) => ({
          savedFilters: state.savedFilters.filter((f) => f.id !== id),
        })),
      getSavedFilter: (id) => get().savedFilters.find((f) => f.id === id),
      updateFilter: (id, name, filters) =>
        set((state) => ({
          savedFilters: state.savedFilters.map((f) =>
            f.id === id ? { ...f, name, filters, createdAt: Date.now() } : f
          ),
        })),
    }),
    {
      name: 'saved-filters-storage',
    }
  )
);

