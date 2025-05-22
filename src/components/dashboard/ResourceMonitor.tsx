import React from 'react';
import { Progress } from '@/components/ui/progress';
import StatusIndicator from '@/components/StatusIndicator';
import { Cpu, Microchip, HardDrive, Server } from 'lucide-react';

interface SystemMetric {
  value: number;
  status: 'normal' | 'warning' | 'critical';
}

interface ResourceMonitorProps {
  cpuUsage: SystemMetric;
  ramUsage: SystemMetric;
  storageUsage: SystemMetric;
  modelStatus: 'idle' | 'processing' | 'error';
  modelName: string;
}

const ResourceMonitor: React.FC<ResourceMonitorProps> = ({
  cpuUsage,
  ramUsage,
  storageUsage,
  modelStatus,
  modelName
}) => {
  // Get status colors
  const getStatusColor = (status: 'normal' | 'warning' | 'critical'): string => {
    switch (status) {
      case 'normal': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
    }
  };

  const getProgressColor = (status: 'normal' | 'warning' | 'critical'): string => {
    switch (status) {
      case 'normal': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
    }
  };

  const getModelStatusIndicator = () => {
    switch (modelStatus) {
      case 'idle':
        return <StatusIndicator status="online" label="Idle" className="text-green-500" />;
      case 'processing':
        return <StatusIndicator status="processing" label="Processing" className="text-pro-primary" />;
      case 'error':
        return <StatusIndicator status="error" label="Error" className="text-red-500" />;
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs text-pro-text-muted dark:text-pro-text-mutedDark font-medium uppercase mb-1">Resource Monitoring</h3>

      {/* CPU Usage */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Cpu className="w-4 h-4 text-pro-secondary" />
            <span className="text-xs">CPU</span>
          </div>
          <span className={`text-xs font-medium ${getStatusColor(cpuUsage.status)}`}>
            {cpuUsage.value}%
          </span>
        </div>
        <Progress value={cpuUsage.value} className="h-1.5 bg-gray-700">
          <div className={`h-full ${getProgressColor(cpuUsage.status)} transition-all`}
               style={{ width: `${cpuUsage.value}%` }} />
        </Progress>
      </div>

      {/* RAM Usage */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Microchip className="w-4 h-4 text-pro-secondary" />
            <span className="text-xs">RAM</span>
          </div>
          <span className={`text-xs font-medium ${getStatusColor(ramUsage.status)}`}>
            {ramUsage.value}%
          </span>
        </div>
        <Progress value={ramUsage.value} className="h-1.5 bg-gray-700">
          <div className={`h-full ${getProgressColor(ramUsage.status)} transition-all`}
               style={{ width: `${ramUsage.value}%` }} />
        </Progress>
      </div>

      {/* AI Model Status */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Server className="w-4 h-4 text-pro-secondary" />
            <span className="text-xs truncate max-w-[150px]">
              {modelName || 'No Model'}
            </span>
          </div>
          <div>
            {getModelStatusIndicator()}
          </div>
        </div>
      </div>

      {/* Storage Usage */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <HardDrive className="w-4 h-4 text-pro-secondary" />
            <span className="text-xs">Storage</span>
          </div>
          <span className={`text-xs font-medium ${getStatusColor(storageUsage.status)}`}>
            {storageUsage.value}%
          </span>
        </div>
        <Progress value={storageUsage.value} className="h-1.5 bg-gray-700">
          <div className={`h-full ${getProgressColor(storageUsage.status)} transition-all`}
               style={{ width: `${storageUsage.value}%` }} />
        </Progress>
      </div>
    </div>
  );
};

export default ResourceMonitor;
