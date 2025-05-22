
import React from 'react';
import { cn } from '@/lib/utils';

type StatusType = 'online' | 'offline' | 'warning' | 'error' | 'processing' | 'secure';

interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  className?: string;
  pulseEffect?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  className,
  pulseEffect = true
}) => {
  const statusColors = {
    online: 'bg-green-500 dark:bg-green-400',
    offline: 'bg-gray-500 dark:bg-gray-400',
    warning: 'bg-yellow-500 dark:bg-yellow-400',
    error: 'bg-red-500 dark:bg-red-400',
    processing: 'bg-pro-primary dark:bg-pro-primary-light',
    secure: 'bg-purple-500 dark:bg-purple-400'
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "h-2.5 w-2.5 rounded-full",
          statusColors[status],
          pulseEffect && "animate-pulse"
        )}
      />
      {label && (
        <span className="text-xs font-medium uppercase tracking-wider text-pro-text-muted dark:text-pro-text-mutedDark">
          {label}
        </span>
      )}
    </div>
  );
};

export default StatusIndicator;
