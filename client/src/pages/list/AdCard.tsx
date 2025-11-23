import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Checkbox } from '@/components/ui/Checkbox';
import { formatPrice, formatDate, getPriorityColor } from '@/lib/utils';
import type { Advertisement } from '@/types';

interface AdCardProps {
  ad: Advertisement;
  isSelected?: boolean;
  onToggleSelect?: (id: number) => void;
}

const AdCard = ({ ad, isSelected, onToggleSelect }: AdCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const location = useLocation();

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/item/${ad.id}${location.search}`}>
        <Card
          className={`hover:shadow-lg transition-shadow cursor-pointer ${
            isSelected ? 'ring-2 ring-primary' : ''
          }`}
        >
          <CardContent className="p-4">
            <div className="flex gap-4">
              {onToggleSelect && (
                <div onClick={handleCheckboxClick} className="flex items-start pt-1">
                  <Checkbox
                    checked={isSelected}
                    onChange={() => onToggleSelect(ad.id)}
                    aria-label={`Выбрать объявление ${ad.title}`}
                  />
                </div>
              )}

              <div className="w-32 h-32 flex-shrink-0 rounded-md overflow-hidden bg-muted relative">
                {imageError ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                    <div className="text-center p-2">
                      <svg
                        className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-600 mb-1"
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
                      <span className="text-xs text-gray-500 dark:text-gray-400">Без фото</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {imageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      </div>
                    )}
                    <img
                      src={ad.images[0] || '/placeholder.svg'}
                      alt={`Фото: ${ad.title}`}
                      className={`w-full h-full object-cover transition-opacity duration-200 ${
                        imageLoading ? 'opacity-0' : 'opacity-100'
                      }`}
                      onError={handleImageError}
                      onLoad={handleImageLoad}
                    />
                  </>
                )}
              </div>

              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-lg line-clamp-2">{ad.title}</h3>
                  <span className="font-bold text-xl text-primary flex-shrink-0">
                    {formatPrice(ad.price)}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {ad.description}
                </p>

                <div className="flex flex-wrap gap-2 items-center mt-auto">
                  <StatusBadge status={ad.status} />

                  {ad.priority === 'urgent' && (
                    <Badge className={getPriorityColor(ad.priority)}>Срочное</Badge>
                  )}

                  <Badge variant="outline">{ad.category}</Badge>

                  <span className="text-xs text-muted-foreground ml-auto">
                    {formatDate(ad.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export { AdCard };
