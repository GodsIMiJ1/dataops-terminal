
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
    online: 'bg-cyber-green',
    offline: 'bg-gray-500',
    warning: 'bg-yellow-500',
    error: 'bg-cyber-red',
    processing: 'bg-cyber-cyan',
    secure: 'bg-purple-500'
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
        <span className="text-xs font-mono uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
};

export default StatusIndicator;
