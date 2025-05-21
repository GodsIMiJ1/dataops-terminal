import React, { useEffect, useState } from 'react';

interface ProgressIndicatorProps {
  type?: 'bar' | 'spinner' | 'dots' | 'pulse';
  progress?: number; // 0-100 for determinate progress
  indeterminate?: boolean;
  status?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  onComplete?: () => void;
}

/**
 * A component for showing progress of long-running operations
 */
const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  type = 'bar',
  progress = 0,
  indeterminate = false,
  status = '',
  color = '#00aaff',
  size = 'medium',
  className = '',
  onComplete
}) => {
  const [internalProgress, setInternalProgress] = useState(progress);
  
  // Update internal progress when prop changes
  useEffect(() => {
    setInternalProgress(progress);
    
    // Call onComplete when progress reaches 100
    if (progress >= 100 && onComplete) {
      onComplete();
    }
  }, [progress, onComplete]);
  
  // For indeterminate progress, simulate progress
  useEffect(() => {
    if (indeterminate) {
      const interval = setInterval(() => {
        setInternalProgress(prev => {
          // Cycle between 0 and 100
          const newProgress = (prev + 1) % 101;
          return newProgress;
        });
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [indeterminate]);
  
  // Size classes
  const sizeClass = {
    small: 'h-1 w-24',
    medium: 'h-2 w-32',
    large: 'h-3 w-48'
  }[size];
  
  // Spinner size
  const spinnerSize = {
    small: 16,
    medium: 24,
    large: 32
  }[size];
  
  // Render different progress indicator types
  const renderProgressIndicator = () => {
    switch (type) {
      case 'bar':
        return (
          <div className={`bg-gray-800 rounded-full overflow-hidden ${sizeClass} ${className}`}>
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: `${internalProgress}%`,
                backgroundColor: color,
                backgroundImage: indeterminate
                  ? 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)'
                  : 'none',
                backgroundSize: '1rem 1rem',
                animation: indeterminate ? 'progress-bar-stripes 1s linear infinite' : 'none'
              }}
            />
          </div>
        );
      
      case 'spinner':
        return (
          <div
            className={`inline-block animate-spin rounded-full border-t-2 border-r-2 border-solid ${className}`}
            style={{
              borderColor: `${color} transparent transparent`,
              width: spinnerSize,
              height: spinnerSize
            }}
          />
        );
      
      case 'dots':
        return (
          <div className={`flex space-x-1 ${className}`}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="rounded-full animate-pulse"
                style={{
                  backgroundColor: color,
                  width: spinnerSize / 3,
                  height: spinnerSize / 3,
                  animationDelay: `${i * 0.15}s`
                }}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <div
            className={`inline-block rounded-full animate-pulse ${className}`}
            style={{
              backgroundColor: color,
              width: spinnerSize,
              height: spinnerSize
            }}
          />
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      {renderProgressIndicator()}
      {status && <span className="text-sm text-gray-300">{status}</span>}
      {type === 'bar' && !indeterminate && (
        <span className="text-xs text-gray-400">{Math.round(internalProgress)}%</span>
      )}
    </div>
  );
};

export default ProgressIndicator;
