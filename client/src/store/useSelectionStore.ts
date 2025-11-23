import { create } from 'zustand';

interface SelectionStore {
  selectedIds: Set<number>;
  toggleSelection: (id: number) => void;
  selectAll: (ids: number[]) => void;
  clearSelection: () => void;
  isSelected: (id: number) => boolean;
}

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  selectedIds: new Set(),
  toggleSelection: (id) =>
    set((state) => {
      const newSet = new Set(state.selectedIds);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return { selectedIds: newSet };
    }),
  selectAll: (ids) =>
    set(() => ({
      selectedIds: new Set(ids),
    })),
  clearSelection: () =>
    set(() => ({
      selectedIds: new Set(),
    })),
  isSelected: (id) => get().selectedIds.has(id),
}));

