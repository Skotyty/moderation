import { cn } from '@/lib/utils';
import { ProgressBar } from './ProgressBar';

interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  progress?: number;
  message?: string;
}

const Loading = ({ 
  className, 
  size = 'md', 
  showProgress = false, 
  progress,
  message 
}: LoadingProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-t-transparent border-primary',
          sizeClasses[size]
        )}
      />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
      {showProgress && (
        <ProgressBar 
          value={progress} 
          className="w-48"
          size={size === 'lg' ? 'md' : 'sm'}
        />
      )}
    </div>
  );
};

export { Loading };



