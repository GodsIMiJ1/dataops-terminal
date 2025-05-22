
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface AlertsPanelProps {
  errors: string[];
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ errors }) => {
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <h3 className="text-xs text-pro-text-muted dark:text-pro-text-mutedDark font-medium uppercase mb-1 flex items-center gap-1">
        <AlertCircle className="w-3 h-3 text-red-500" />
        System Alerts
      </h3>

      <div className="bg-gray-800 border border-pro-border-dark rounded flex-1 overflow-y-auto p-2 max-h-[calc(100%-24px)]">
        {errors.length > 0 ? (
          <div className="space-y-1">
            {errors.map((error, index) => (
              <div key={index} className="text-xs text-red-500 border-b border-gray-700 pb-1">
                {error}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-pro-text-muted dark:text-pro-text-mutedDark h-full flex items-center justify-center">
            No alerts detected
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;
