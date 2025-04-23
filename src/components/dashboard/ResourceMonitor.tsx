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
      case 'normal': return 'text-cyber-green';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-cyber-red';
    }
  };
  
  const getProgressColor = (status: 'normal' | 'warning' | 'critical'): string => {
    switch (status) {
      case 'normal': return 'bg-cyber-green';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-cyber-red';
    }
  };
  
  const getModelStatusIndicator = () => {
    switch (modelStatus) {
      case 'idle':
        return <StatusIndicator status="online" label="IDLE" className="text-cyber-green" />;
      case 'processing':
        return <StatusIndicator status="processing" label="PROCESSING" className="text-cyber-cyan" />;
      case 'error':
        return <StatusIndicator status="error" label="ERROR" className="text-cyber-red" />;
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-mono text-gray-400 uppercase mb-1">Resource Monitoring</h3>
      
      {/* CPU Usage */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Cpu className="w-4 h-4 text-cyber-cyan" />
            <span className="text-xs font-mono">CPU</span>
          </div>
          <span className={`text-xs font-mono font-bold ${getStatusColor(cpuUsage.status)}`}>
            {cpuUsage.value}%
          </span>
        </div>
        <Progress value={cpuUsage.value} className="h-1.5 bg-cyber-darkgray">
          <div className={`h-full ${getProgressColor(cpuUsage.status)} transition-all`} 
               style={{ width: `${cpuUsage.value}%` }} />
        </Progress>
      </div>
      
      {/* RAM Usage */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Microchip className="w-4 h-4 text-cyber-cyan" />
            <span className="text-xs font-mono">RAM</span>
          </div>
          <span className={`text-xs font-mono font-bold ${getStatusColor(ramUsage.status)}`}>
            {ramUsage.value}%
          </span>
        </div>
        <Progress value={ramUsage.value} className="h-1.5 bg-cyber-darkgray">
          <div className={`h-full ${getProgressColor(ramUsage.status)} transition-all`} 
               style={{ width: `${ramUsage.value}%` }} />
        </Progress>
      </div>
      
      {/* AI Model Status */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Server className="w-4 h-4 text-cyber-cyan" />
            <span className="text-xs font-mono truncate max-w-[150px]">
              {modelName || 'NO MODEL'}
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
            <HardDrive className="w-4 h-4 text-cyber-cyan" />
            <span className="text-xs font-mono">STORAGE</span>
          </div>
          <span className={`text-xs font-mono font-bold ${getStatusColor(storageUsage.status)}`}>
            {storageUsage.value}%
          </span>
        </div>
        <Progress value={storageUsage.value} className="h-1.5 bg-cyber-darkgray">
          <div className={`h-full ${getProgressColor(storageUsage.status)} transition-all`} 
               style={{ width: `${storageUsage.value}%` }} />
        </Progress>
      </div>
    </div>
  );
};

export default ResourceMonitor;
