import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value?: number; // 0-100, если undefined - индетерминированный режим
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'warning' | 'destructive';
}

const ProgressBar = ({
  value,
  className,
  showLabel = false,
  size = 'md',
  variant = 'primary',
}: ProgressBarProps) => {
  const isIndeterminate = value === undefined;
  const percentage = value !== undefined ? Math.min(Math.max(value, 0), 100) : 0;

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const variantClasses = {
    primary: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    destructive: 'bg-destructive',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && !isIndeterminate && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-muted-foreground">Загрузка</span>
          <span className="text-sm font-medium">{percentage}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full bg-muted rounded-full overflow-hidden',
          sizeClasses[size]
        )}
      >
        {isIndeterminate ? (
          // Индетерминированный режим - бесконечная анимация
          <motion.div
            className={cn(
              'h-full rounded-full',
              variantClasses[variant]
            )}
            initial={{ x: '-100%', width: '30%' }}
            animate={{ x: '400%' }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ) : (
          // Детерминированный режим - показываем процент
          <motion.div
            className={cn(
              'h-full rounded-full',
              variantClasses[variant]
            )}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        )}
      </div>
    </div>
  );
};

export { ProgressBar };


