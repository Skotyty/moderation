import { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAds, useApproveAd, useRejectAd } from '@/hooks/useAds';
import { useHotkeys } from '@/hooks/useHotkeys';
import { useSelectionStore } from '@/store/useSelectionStore';
import { AdCard } from './AdCard';
import { Filters } from './Filters';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { PageTransition } from '@/components/ui/PageTransition';
import { toast } from '@/components/ui/Toast';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/Pagination';
import { debounce } from '@/lib/utils';
import type { AdsFilters, RejectReason } from '@/types';

const ListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState<RejectReason>('Другое');
  const [rejectComment, setRejectComment] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { selectedIds, toggleSelection, selectAll, clearSelection } = useSelectionStore();

  const getFiltersFromParams = (): AdsFilters => {
    const filters: AdsFilters = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: 10,
      sortBy: (searchParams.get('sortBy') as 'createdAt' | 'price' | 'priority') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    const status = searchParams.getAll('status');
    if (status.length > 0) {
      filters.status = status as any[];
    }

    const categoryId = searchParams.get('categoryId');
    if (categoryId) {
      filters.categoryId = parseInt(categoryId);
    }

    const minPrice = searchParams.get('minPrice');
    if (minPrice) {
      filters.minPrice = parseFloat(minPrice);
    }

    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice) {
      filters.maxPrice = parseFloat(maxPrice);
    }

    const search = searchParams.get('search');
    if (search) {
      filters.search = search;
    }

    return filters;
  };

  const [filters, setFilters] = useState<AdsFilters>(getFiltersFromParams());

  useEffect(() => {
    const filtersFromParams = getFiltersFromParams();
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(filtersFromParams);
    if (filtersChanged) {
      setFilters(filtersFromParams);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data, isLoading, error } = useAds(filters, false);
  const approveAd = useApproveAd();
  const rejectAd = useRejectAd();

  const updateFilters = useCallback(
    (newFilters: AdsFilters) => {
      const params = new URLSearchParams();

      if (newFilters.page) params.set('page', newFilters.page.toString());
      if (newFilters.sortBy) params.set('sortBy', newFilters.sortBy);
      if (newFilters.sortOrder) params.set('sortOrder', newFilters.sortOrder);
      if (newFilters.status) {
        newFilters.status.forEach((s) => params.append('status', s));
      }
      if (newFilters.categoryId) params.set('categoryId', newFilters.categoryId.toString());
      if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice.toString());
      if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice.toString());
      if (newFilters.search) params.set('search', newFilters.search);

      setSearchParams(params);
      setFilters(newFilters);
    },
    [setSearchParams]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateFilters = useCallback(debounce(updateFilters, 500), []);

  const handleFiltersChange = (newFilters: AdsFilters) => {
    if (newFilters.search !== filters.search) {
      debouncedUpdateFilters(newFilters);
    } else {
      updateFilters(newFilters);
    }
  };

  const handleBulkApprove = async () => {
    try {
      const promises = Array.from(selectedIds).map((id) => approveAd.mutateAsync(id));
      await Promise.all(promises);
      clearSelection();
      toast.success('Объявления одобрены', `Успешно одобрено ${selectedIds.size} объявлений`);
    } catch (error) {
      toast.error('Ошибка', 'Не удалось одобрить объявления');
    }
  };

  const handleBulkReject = () => {
    setIsRejectModalOpen(true);
  };

  const confirmBulkReject = async () => {
    try {
      const promises = Array.from(selectedIds).map((id) =>
        rejectAd.mutateAsync({
          id,
          data: { reason: rejectReason, comment: rejectComment },
        })
      );
      await Promise.all(promises);
      clearSelection();
      setIsRejectModalOpen(false);
      setRejectComment('');
      toast.success('Объявления отклонены', `Успешно отклонено ${selectedIds.size} объявлений`);
    } catch (error) {
      toast.error('Ошибка', 'Не удалось отклонить объявления');
    }
  };

  useHotkeys({
    '/': () => {
      searchInputRef.current?.focus();
    },
  });

  if (isLoading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loading size="lg" showProgress message="Загрузка объявлений..." />
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="text-center text-destructive">
          Ошибка загрузки данных. Попробуйте перезагрузить страницу.
        </div>
      </PageTransition>
    );
  }

  const ads = data?.ads || [];
  const pagination = data?.pagination;

  const generatePaginationItems = () => {
    if (!pagination) return [];

    const { currentPage, totalPages } = pagination;
    const delta = 2;
    const items: (number | 'ellipsis')[] = [];

    items.push(1);

    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    if (rangeStart > 2) {
      items.push('ellipsis');
    }

    // Добавляем страницы вокруг текущей
    for (let i = rangeStart; i <= rangeEnd; i++) {
      items.push(i);
    }

    if (rangeEnd < totalPages - 1) {
      items.push('ellipsis');
    }

    if (totalPages > 1) {
      items.push(totalPages);
    }

    return items;
  };

  return (
    <PageTransition>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Объявления</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          Всего: {pagination?.totalItems || 0} объявлений
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Filters 
            filters={filters} 
            onFiltersChange={handleFiltersChange}
            searchInputRef={searchInputRef}
          />
        </div>

        <div className="lg:col-span-3 space-y-4">
          {selectedIds.size > 0 && (
            <div className="bg-primary/10 p-4 rounded-lg flex items-center justify-between">
              <span className="font-medium">Выбрано: {selectedIds.size}</span>
              <div className="flex gap-2">
                <Button variant="success" size="sm" onClick={handleBulkApprove}>
                  Одобрить выбранные
                </Button>
                <Button variant="destructive" size="sm" onClick={handleBulkReject}>
                  Отклонить выбранные
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Отменить
                </Button>
              </div>
            </div>
          )}

          {ads.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedIds.size === ads.length) {
                    clearSelection();
                  } else {
                    selectAll(ads.map((ad) => ad.id));
                  }
                }}
              >
                {selectedIds.size === ads.length ? 'Снять выбор' : 'Выбрать все'}
              </Button>
            </div>
          )}

          {ads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Объявления не найдены
            </div>
          ) : (
            <div className="space-y-4">
              {ads.map((ad) => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  isSelected={selectedIds.has(ad.id)}
                  onToggleSelect={toggleSelection}
                />
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <Pagination className="pt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      updateFilters({ ...filters, page: pagination.currentPage - 1 })
                    }
                    disabled={pagination.currentPage === 1}
                  />
                </PaginationItem>

                {generatePaginationItems().map((item, index) => {
                  if (item === 'ellipsis') {
                    return (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  return (
                    <PaginationItem key={item}>
                      <PaginationLink
                        onClick={() => updateFilters({ ...filters, page: item })}
                        isActive={pagination.currentPage === item}
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      updateFilters({ ...filters, page: pagination.currentPage + 1 })
                    }
                    disabled={pagination.currentPage === pagination.totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>

      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Отклонить объявления"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Причина отклонения</label>
            <select
              className="w-full p-2 border rounded-md"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value as RejectReason)}
            >
              <option value="Запрещенный товар">Запрещенный товар</option>
              <option value="Неверная категория">Неверная категория</option>
              <option value="Некорректное описание">Некорректное описание</option>
              <option value="Проблемы с фото">Проблемы с фото</option>
              <option value="Подозрение на мошенничество">Подозрение на мошенничество</option>
              <option value="Другое">Другое</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Комментарий</label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={3}
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Дополнительный комментарий..."
            />
          </div>

          <div className="flex gap-2">
            <Button variant="destructive" onClick={confirmBulkReject} className="flex-1">
              Отклонить
            </Button>
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
              Отмена
            </Button>
          </div>
        </div>
      </Modal>
    </div>
    </PageTransition>
  );
};

export default ListPage;
