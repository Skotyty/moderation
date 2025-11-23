import { useState } from 'react';
import { useFiltersStore, type SavedFilter } from '@/store/useFiltersStore';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { toast } from './Toast';
import { Bookmark, Trash2, Check, X } from 'lucide-react';
import type { AdsFilters } from '@/types';

interface SavedFiltersProps {
  currentFilters: AdsFilters;
  onApplyFilter: (filters: AdsFilters) => void;
}

const SavedFilters = ({ currentFilters, onApplyFilter }: SavedFiltersProps) => {
  const { savedFilters, saveFilter, removeFilter, updateFilter } = useFiltersStore();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null);

  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      toast.error('Ошибка', 'Введите название фильтра');
      return;
    }

    // Проверяем, есть ли активные фильтры
    const hasActiveFilters =
      currentFilters.status ||
      currentFilters.categoryId ||
      currentFilters.minPrice ||
      currentFilters.maxPrice ||
      currentFilters.search ||
      currentFilters.sortBy !== 'createdAt' ||
      currentFilters.sortOrder !== 'desc';

    if (!hasActiveFilters) {
      toast.error('Ошибка', 'Нет активных фильтров для сохранения');
      return;
    }

    if (editingFilter) {
      updateFilter(editingFilter.id, filterName, currentFilters);
      toast.success('Фильтр обновлён', `"${filterName}" успешно обновлён`);
    } else {
      saveFilter(filterName, currentFilters);
      toast.success('Фильтр сохранён', `"${filterName}" добавлен в избранное`);
    }

    setFilterName('');
    setIsSaveModalOpen(false);
    setEditingFilter(null);
  };

  const handleDeleteFilter = (id: string, name: string) => {
    removeFilter(id);
    toast.success('Фильтр удалён', `"${name}" удалён из избранного`);
  };

  const handleApplyFilter = (filter: SavedFilter) => {
    onApplyFilter(filter.filters);
    toast.success('Фильтр применён', `Применён фильтр "${filter.name}"`);
  };

  const handleEditFilter = (filter: SavedFilter) => {
    setEditingFilter(filter);
    setFilterName(filter.name);
    setIsSaveModalOpen(true);
  };

  const getFilterDescription = (filters: AdsFilters): string => {
    const parts: string[] = [];

    if (filters.status && filters.status.length > 0) {
      parts.push(`Статус: ${filters.status.length}`);
    }
    if (filters.categoryId !== undefined) {
      parts.push('Категория');
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      parts.push('Цена');
    }
    if (filters.search) {
      parts.push(`Поиск: "${filters.search}"`);
    }
    if (filters.sortBy && filters.sortBy !== 'createdAt') {
      parts.push('Сортировка');
    }

    return parts.length > 0 ? parts.join(' • ') : 'Без фильтров';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Сохранённые фильтры</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setEditingFilter(null);
            setFilterName('');
            setIsSaveModalOpen(true);
          }}
          className="text-xs"
        >
          <Bookmark className="h-3 w-3 mr-1" />
          Сохранить текущий
        </Button>
      </div>

      {savedFilters.length === 0 ? (
        <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-md text-center">
          Нет сохранённых фильтров
        </div>
      ) : (
        <div className="space-y-2">
          {savedFilters.map((filter) => (
            <div
              key={filter.id}
              className="group p-3 border rounded-md hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  onClick={() => handleApplyFilter(filter)}
                  className="flex-1 text-left"
                >
                  <div className="font-medium text-sm mb-1">{filter.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {getFilterDescription(filter.filters)}
                  </div>
                </button>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditFilter(filter)}
                    className="p-1 hover:bg-primary/10 rounded text-primary"
                    title="Редактировать"
                    aria-label={`Редактировать фильтр ${filter.name}`}
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteFilter(filter.id, filter.name)}
                    className="p-1 hover:bg-destructive/10 rounded text-destructive"
                    title="Удалить"
                    aria-label={`Удалить фильтр ${filter.name}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => {
          setIsSaveModalOpen(false);
          setFilterName('');
          setEditingFilter(null);
        }}
        title={editingFilter ? 'Обновить фильтр' : 'Сохранить фильтр'}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="filter-name" className="block text-sm font-medium mb-2">
              Название фильтра
            </label>
            <Input
              id="filter-name"
              placeholder="Например: Срочные на модерации"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSaveFilter();
                }
              }}
              autoFocus
            />
          </div>

          <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-md">
            <div className="font-medium mb-1">Текущие фильтры:</div>
            <div>{getFilterDescription(currentFilters)}</div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveFilter} className="flex-1">
              <Bookmark className="h-4 w-4 mr-2" />
              {editingFilter ? 'Обновить' : 'Сохранить'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsSaveModalOpen(false);
                setFilterName('');
                setEditingFilter(null);
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Отмена
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Enter — сохранить
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { SavedFilters };



