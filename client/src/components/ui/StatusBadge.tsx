import { Badge } from './Badge';
import { getStatusColor } from '@/lib/utils';
import type { AdStatus } from '@/types';

interface StatusBadgeProps {
  status: AdStatus;
}

const statusLabels: Record<AdStatus, string> = {
  pending: 'На модерации',
  approved: 'Одобрено',
  rejected: 'Отклонено',
  draft: 'Черновик',
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <Badge className={getStatusColor(status)}>
      {statusLabels[status]}
    </Badge>
  );
};


