
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface AlertsPanelProps {
  errors: string[];
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ errors }) => {
  return (
    <div className="flex-1 overflow-hidden">
      <h3 className="text-xs font-mono text-gray-400 uppercase mb-1 flex items-center gap-1">
        <AlertCircle className="w-3 h-3 text-cyber-red" />
        System Alerts
      </h3>
      
      <div className="bg-cyber-darkgray/50 border border-cyber-red/30 rounded h-[90%] overflow-y-auto p-2">
        {errors.length > 0 ? (
          <div className="space-y-1">
            {errors.map((error, index) => (
              <div key={index} className="text-xs font-mono text-cyber-red border-b border-cyber-red/20 pb-1">
                {error}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs font-mono text-gray-500 h-full flex items-center justify-center">
            No alerts detected
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;
