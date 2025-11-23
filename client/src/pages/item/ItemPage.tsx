import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAd, useApproveAd, useRejectAd, useRequestChanges, useAds } from '@/hooks/useAds';
import { useHotkeys } from '@/hooks/useHotkeys';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { PageTransition } from '@/components/ui/PageTransition';
import { toast } from '@/components/ui/Toast';
import {
  formatPrice,
  formatDateTime,
  getPriorityColor,
  formatDate,
} from '@/lib/utils';
import type { RejectReason, AdsFilters } from '@/types';
import { ArrowLeft, ChevronLeft, ChevronRight, Check, X, Edit } from 'lucide-react';

const ItemPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const adId = parseInt(id || '0');

  const getFiltersFromParams = (): AdsFilters => {
    const filters: AdsFilters = {
      limit: 1000, // Получаем все отфильтрованные объявления для навигации
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

  const filters = useMemo(() => getFiltersFromParams(), [searchParams]);

  const { data: ad, isLoading } = useAd(adId);
  const { data: adsData } = useAds(filters, true);
  const approveAd = useApproveAd();
  const rejectAd = useRejectAd();
  const requestChanges = useRequestChanges();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isRequestChangesModalOpen, setIsRequestChangesModalOpen] = useState(false);
  const [reason, setReason] = useState<RejectReason>('Другое');
  const [comment, setComment] = useState('');
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [imagesLoading, setImagesLoading] = useState<Set<number>>(new Set([0]));

  // Вычисляем текущую позицию в списке для навигации
  const navigationInfo = useMemo(() => {
    if (!adsData?.ads) {
      return { currentIndex: -1, prevId: null, nextId: null, hasNext: false, hasPrev: false };
    }

    const ids = adsData.ads.map((ad) => ad.id);
    const currentIndex = ids.indexOf(adId);

    if (currentIndex === -1) {
      return { currentIndex: -1, prevId: null, nextId: null, hasNext: false, hasPrev: false };
    }

    return {
      currentIndex,
      prevId: currentIndex > 0 ? ids[currentIndex - 1] : null,
      nextId: currentIndex < ids.length - 1 ? ids[currentIndex + 1] : null,
      hasPrev: currentIndex > 0,
      hasNext: currentIndex < ids.length - 1,
    };
  }, [adsData, adId]);

  const handleApprove = async () => {
    try {
      await approveAd.mutateAsync(adId);
      toast.success('Объявление одобрено', 'Объявление успешно одобрено');
    } catch (error) {
      toast.error('Ошибка', 'Не удалось одобрить объявление');
    }
  };

  const handleReject = async () => {
    try {
      await rejectAd.mutateAsync({
        id: adId,
        data: { reason, comment },
      });
      setIsRejectModalOpen(false);
      setReason('Другое');
      setComment('');
      toast.success('Объявление отклонено', `Причина: ${reason}`);
    } catch (error) {
      toast.error('Ошибка', 'Не удалось отклонить объявление');
    }
  };

  const handleRequestChanges = async () => {
    if (!comment.trim()) return;
    try {
      await requestChanges.mutateAsync({
        id: adId,
        data: { reason, comment },
      });
      setIsRequestChangesModalOpen(false);
      setReason('Другое');
      setComment('');
      toast.warning('Отправлено на доработку', 'Объявление возвращено продавцу');
    } catch (error) {
      toast.error('Ошибка', 'Не удалось вернуть объявление на доработку');
    }
  };

  const handleRejectModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !rejectAd.isPending) {
      e.preventDefault();
      handleReject();
    }
  };

  const handleRequestChangesModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !requestChanges.isPending && comment.trim()) {
      e.preventDefault();
      handleRequestChanges();
    }
  };

  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
    setImagesLoading((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const handleImageLoad = (index: number) => {
    setImagesLoading((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  useHotkeys({
    a: () => {
      if (ad?.status === 'pending') {
        handleApprove();
      }
    },
    e: () => {
      if (ad?.status === 'pending') {
        setIsRequestChangesModalOpen(true);
      }
    },
    d: () => {
      if (ad?.status === 'pending') {
        setIsRejectModalOpen(true);
      }
    },
    arrowright: () => {
      if (navigationInfo.hasNext && navigationInfo.nextId) {
        navigate(`/item/${navigationInfo.nextId}${location.search}`);
      }
    },
    arrowleft: () => {
      if (navigationInfo.hasPrev && navigationInfo.prevId) {
        navigate(`/item/${navigationInfo.prevId}${location.search}`);
      }
    },
  });

  if (isLoading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loading size="lg" showProgress message="Загрузка объявления..." />
        </div>
      </PageTransition>
    );
  }

  if (!ad) {
    return (
      <PageTransition>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Объявление не найдено</h2>
          <Link to={`/list${location.search}`}>
            <Button>Вернуться к списку</Button>
          </Link>
        </div>
      </PageTransition>
    );
  }

  const reasonOptions: RejectReason[] = [
    'Запрещенный товар',
    'Неверная категория',
    'Некорректное описание',
    'Проблемы с фото',
    'Подозрение на мошенничество',
    'Другое',
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to={`/list${location.search}`}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к списку
          </Button>
        </Link>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              navigationInfo.prevId && navigate(`/item/${navigationInfo.prevId}${location.search}`)
            }
            disabled={!navigationInfo.hasPrev}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Предыдущее
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              navigationInfo.nextId && navigate(`/item/${navigationInfo.nextId}${location.search}`)
            }
            disabled={!navigationInfo.hasNext}
          >
            Следующее
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                  {imageErrors.has(currentImageIndex) ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                      <div className="text-center p-4">
                        <svg
                          className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Изображение не загружено
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {imagesLoading.has(currentImageIndex) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                        </div>
                      )}
                      <img
                        src={ad.images[currentImageIndex] || '/placeholder.svg'}
                        alt={`Фото: ${ad.title} - изображение ${currentImageIndex + 1}`}
                        className={`w-full h-full object-cover transition-opacity duration-200 ${
                          imagesLoading.has(currentImageIndex) ? 'opacity-0' : 'opacity-100'
                        }`}
                        onError={() => handleImageError(currentImageIndex)}
                        onLoad={() => handleImageLoad(currentImageIndex)}
                      />
                    </>
                  )}
                </div>

                {ad.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {ad.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentImageIndex(index);
                          if (!imagesLoading.has(index) && !imageErrors.has(index)) {
                            setImagesLoading((prev) => new Set(prev).add(index));
                          }
                        }}
                        className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                          index === currentImageIndex ? 'border-primary' : 'border-transparent'
                        }`}
                      >
                        {imageErrors.has(index) ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                            <svg
                              className="w-6 h-6 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        ) : (
                          <img
                            src={image}
                            alt={`Миниатюра ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={() => handleImageError(index)}
                            onLoad={() => handleImageLoad(index)}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle>{ad.title}</CardTitle>
                  <div className="flex gap-2">
                    <StatusBadge status={ad.status} />
                    {ad.priority === 'urgent' && (
                      <Badge className={getPriorityColor(ad.priority)}>Срочное</Badge>
                    )}
                    <Badge variant="outline">{ad.category}</Badge>
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary">{formatPrice(ad.price)}</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Описание</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{ad.description}</p>
              </div>

              {Object.keys(ad.characteristics).length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Характеристики</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <tbody>
                        {Object.entries(ad.characteristics).map(([key, value], index) => (
                          <tr
                            key={key}
                            className={index % 2 === 0 ? 'bg-muted/50' : ''}
                          >
                            <td className="px-4 py-2 font-medium">{key}</td>
                            <td className="px-4 py-2">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {ad.moderationHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>История модерации</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ad.moderationHistory.map((record) => (
                    <div
                      key={record.id}
                      className="border-l-2 border-primary pl-4 py-2"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{record.moderatorName}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDateTime(record.timestamp)}
                        </span>
                      </div>
                      <div className="text-sm">
                        <Badge variant="outline" className="mb-2">
                          {record.action === 'approved' && 'Одобрено'}
                          {record.action === 'rejected' && 'Отклонено'}
                          {record.action === 'requestChanges' && 'Запрошены изменения'}
                        </Badge>
                        {record.reason && (
                          <div className="text-muted-foreground">
                            Причина: {record.reason}
                          </div>
                        )}
                        {record.comment && (
                          <div className="text-muted-foreground mt-1">{record.comment}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Продавец</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="font-semibold text-lg">{ad.seller.name}</div>
                <div className="text-sm text-muted-foreground">
                  Рейтинг: {ad.seller.rating} / 5
                </div>
              </div>
              <div className="text-sm">
                <div>Объявлений: {ad.seller.totalAds}</div>
                <div>На сайте с: {formatDate(ad.seller.registeredAt)}</div>
              </div>
            </CardContent>
          </Card>

          {ad.status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Модерация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="success"
                  className="w-full"
                  onClick={handleApprove}
                  disabled={approveAd.isPending}
                >
                  <Check className="h-4 w-4 mr-2" />
                  {approveAd.isPending ? 'Обработка...' : 'Одобрить (A)'}
                </Button>
                <Button
                  variant="warning"
                  className="w-full"
                  onClick={() => setIsRequestChangesModalOpen(true)}
                  disabled={requestChanges.isPending}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Вернуть на доработку (E)
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setIsRejectModalOpen(true)}
                  disabled={rejectAd.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Отклонить (D)
                </Button>

                <div className="pt-4 text-xs text-muted-foreground space-y-1">
                  <div className="font-medium">Горячие клавиши:</div>
                  <div>A — Одобрить</div>
                  <div>E — Вернуть на доработку</div>
                  <div>D — Отклонить</div>
                  <div>← → — Навигация</div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Создано:</span>
                <div>{formatDateTime(ad.createdAt)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Обновлено:</span>
                <div>{formatDateTime(ad.updatedAt)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">ID:</span>
                <div>{ad.id}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Отклонить объявление"
      >
        <div className="space-y-4" onKeyDown={handleRejectModalKeyDown}>
          <div>
            <label className="block text-sm font-medium mb-2">Причина отклонения *</label>
            <select
              className="w-full p-2 border rounded-md bg-background"
              value={reason}
              onChange={(e) => setReason(e.target.value as RejectReason)}
            >
              {reasonOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Комментарий</label>
            <textarea
              className="w-full p-2 border rounded-md bg-background"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Дополнительный комментарий..."
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectAd.isPending}
              className="flex-1"
            >
              {rejectAd.isPending ? 'Обработка...' : 'Отклонить'}
            </Button>
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
              Отмена
            </Button>
          </div>
          <div className="text-xs text-muted-foreground text-center">
            Enter — отправить, Shift+Enter — новая строка
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isRequestChangesModalOpen}
        onClose={() => setIsRequestChangesModalOpen(false)}
        title="Вернуть на доработку"
      >
        <div className="space-y-4" onKeyDown={handleRequestChangesModalKeyDown}>
          <div>
            <label className="block text-sm font-medium mb-2">Причина *</label>
            <select
              className="w-full p-2 border rounded-md bg-background"
              value={reason}
              onChange={(e) => setReason(e.target.value as RejectReason)}
            >
              {reasonOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Комментарий *</label>
            <textarea
              className="w-full p-2 border rounded-md bg-background"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Что нужно исправить..."
              required
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="warning"
              onClick={handleRequestChanges}
              disabled={requestChanges.isPending || !comment.trim()}
              className="flex-1"
            >
              {requestChanges.isPending ? 'Обработка...' : 'Отправить'}
            </Button>
            <Button variant="outline" onClick={() => setIsRequestChangesModalOpen(false)}>
              Отмена
            </Button>
          </div>
          <div className="text-xs text-muted-foreground text-center">
            Enter — отправить, Shift+Enter — новая строка
          </div>
        </div>
      </Modal>
    </div>
    </PageTransition>
  );
};

export default ItemPage;
