import { useState, useEffect, RefObject } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SavedFilters } from '@/components/ui/SavedFilters';
import type { AdsFilters, AdStatus } from '@/types';

interface FiltersProps {
  filters: AdsFilters;
  onFiltersChange: (filters: AdsFilters) => void;
  searchInputRef?: RefObject<HTMLInputElement | null>;
}

const Filters = ({ filters, onFiltersChange, searchInputRef }: FiltersProps) => {
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice?.toString() || '');
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice?.toString() || '');

  useEffect(() => {
    setLocalSearch(filters.search || '');
  }, [filters.search]);

  useEffect(() => {
    setLocalMinPrice(filters.minPrice?.toString() || '');
  }, [filters.minPrice]);

  useEffect(() => {
    setLocalMaxPrice(filters.maxPrice?.toString() || '');
  }, [filters.maxPrice]);

  const statusOptions: { value: AdStatus; label: string }[] = [
    { value: 'pending', label: 'На модерации' },
    { value: 'approved', label: 'Одобрено' },
    { value: 'rejected', label: 'Отклонено' },
    { value: 'draft', label: 'Черновик' },
  ];

  const categories = [
    { id: 0, name: 'Электроника' },
    { id: 1, name: 'Недвижимость' },
    { id: 2, name: 'Транспорт' },
    { id: 3, name: 'Работа' },
    { id: 4, name: 'Услуги' },
    { id: 5, name: 'Животные' },
    { id: 6, name: 'Мода' },
    { id: 7, name: 'Детское' },
  ];

  const handleStatusToggle = (status: AdStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];

    onFiltersChange({ ...filters, status: newStatuses, page: 1 });
  };

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    onFiltersChange({ ...filters, search: value, page: 1 });
  };

  const handleReset = () => {
    setLocalSearch('');
    setLocalMinPrice('');
    setLocalMaxPrice('');
    onFiltersChange({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const MAX_PRICE = 10000000;

  const handlePriceChange = (value: string, setter: (val: string) => void) => {
    if (value === '' || /^\d+$/.test(value)) {
      const numValue = value === '' ? 0 : parseInt(value, 10);
      if (numValue <= MAX_PRICE) {
        setter(value);
      }
    }
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E' || e.key === '.') {
      e.preventDefault();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const minPrice = localMinPrice !== '' ? parseInt(localMinPrice, 10) : undefined;
      const maxPrice = localMaxPrice !== '' ? parseInt(localMaxPrice, 10) : undefined;
      
      if (minPrice !== filters.minPrice || maxPrice !== filters.maxPrice) {
        onFiltersChange({
          ...filters,
          minPrice,
          maxPrice,
          page: 1,
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localMinPrice, localMaxPrice]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleAllStatuses = () => {
    const currentStatuses = filters.status || [];
    const allStatuses = statusOptions.map(opt => opt.value);
    
    if (currentStatuses.length >= allStatuses.length - 1) {
      onFiltersChange({ ...filters, status: undefined, page: 1 });
    } else {
      onFiltersChange({ ...filters, status: allStatuses, page: 1 });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Фильтры</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium mb-2">
            Поиск
          </label>
          <Input
            ref={searchInputRef}
            id="search"
            placeholder="Поиск по названию..."
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Статус</label>
            <button
              onClick={handleToggleAllStatuses}
              className="text-xs text-primary hover:underline focus:outline-none"
              type="button"
            >
              {(filters.status?.length || 0) >= statusOptions.length - 1 ? 'Снять все' : 'Выбрать все'}
            </button>
          </div>
          
          {!filters.status || filters.status.length === 0 ? (
            <div className="text-xs text-muted-foreground mb-2 p-2 bg-muted/50 rounded">
              Не выбрано — показываются все объявления
            </div>
          ) : (
            <div className="text-xs text-muted-foreground mb-2 p-2 bg-primary/5 rounded">
              Показываются объявления с выбранными статусами ({filters.status.length} из {statusOptions.length})
            </div>
          )}
          
          <div className="space-y-2">
            {statusOptions.map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={filters.status?.includes(option.value) || false}
                  onChange={() => handleStatusToggle(option.value)}
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-2">
            Категория
          </label>
          <Select
            id="category"
            value={filters.categoryId?.toString() || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                categoryId: e.target.value ? parseInt(e.target.value) : undefined,
                page: 1,
              })
            }
          >
            <option value="">Все категории</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Диапазон цен</label>
          <div className="flex gap-2">
            <Input
              type="number"
              min="0"
              max={MAX_PRICE}
              step="1"
              placeholder="От"
              value={localMinPrice}
              onChange={(e) => handlePriceChange(e.target.value, setLocalMinPrice)}
              onKeyDown={handlePriceKeyDown}
            />
            <Input
              type="number"
              min="0"
              max={MAX_PRICE}
              step="1"
              placeholder="До"
              value={localMaxPrice}
              onChange={(e) => handlePriceChange(e.target.value, setLocalMaxPrice)}
              onKeyDown={handlePriceKeyDown}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Максимум: {MAX_PRICE.toLocaleString('ru-RU')} ₽
          </p>
        </div>

        <div>
          <label htmlFor="sortBy" className="block text-sm font-medium mb-2">
            Сортировка
          </label>
          <Select
            id="sortBy"
            value={`${filters.sortBy || 'createdAt'}-${filters.sortOrder || 'desc'}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-') as [
                'createdAt' | 'price' | 'priority',
                'asc' | 'desc'
              ];
              onFiltersChange({ ...filters, sortBy, sortOrder, page: 1 });
            }}
          >
            <option value="createdAt-desc">Дата создания (новые)</option>
            <option value="createdAt-asc">Дата создания (старые)</option>
            <option value="price-asc">Цена (возрастание)</option>
            <option value="price-desc">Цена (убывание)</option>
            <option value="priority-desc">По приоритету</option>
          </Select>
        </div>

        <Button variant="outline" onClick={handleReset} className="w-full">
          Сбросить фильтры
        </Button>

        <div className="pt-4 border-t">
          <SavedFilters currentFilters={filters} onApplyFilter={onFiltersChange} />
        </div>
      </CardContent>
    </Card>
  );
};

export { Filters };
