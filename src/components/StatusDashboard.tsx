
import React, { useState, useEffect } from 'react';
import StatusHeader from '@/components/dashboard/StatusHeader';
import ConnectionStatus from '@/components/dashboard/ConnectionStatus';
import ResourceMonitor from '@/components/dashboard/ResourceMonitor';
import AlertsPanel from '@/components/dashboard/AlertsPanel';

interface SystemMetric {
  value: number;
  status: 'normal' | 'warning' | 'critical';
}

const StatusDashboard: React.FC = () => {
  // Simulated system metrics
  const [cpuUsage, setCpuUsage] = useState<SystemMetric>({ value: 45, status: 'normal' });
  const [ramUsage, setRamUsage] = useState<SystemMetric>({ value: 62, status: 'warning' });
  const [sshStatus, setSshStatus] = useState<boolean>(true);
  const [modelStatus, setModelStatus] = useState<'idle' | 'processing' | 'error'>('idle');
  const [errors, setErrors] = useState<string[]>([]);
  
  // Simulate changing system metrics
  useEffect(() => {
    const simulateMetrics = () => {
      // Simulate CPU fluctuations
      setCpuUsage(prev => {
        const newValue = prev.value + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5);
        const boundedValue = Math.max(30, Math.min(95, newValue));
        return {
          value: boundedValue,
          status: boundedValue > 80 ? 'critical' : boundedValue > 60 ? 'warning' : 'normal'
        };
      });
      
      // Simulate RAM fluctuations
      setRamUsage(prev => {
        const newValue = prev.value + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3);
        const boundedValue = Math.max(40, Math.min(90, newValue));
        return {
          value: boundedValue,
          status: boundedValue > 75 ? 'critical' : boundedValue > 55 ? 'warning' : 'normal'
        };
      });
      
      // Occasionally simulate SSH connection changes
      if (Math.random() > 0.95) {
        setSshStatus(prev => !prev);
        if (!sshStatus) {
          setErrors(prev => [...prev, `SSH connection lost at ${new Date().toLocaleTimeString()}`]);
        }
      }
      
      // Occasionally simulate model status changes
      if (Math.random() > 0.9) {
        const statuses: ('idle' | 'processing' | 'error')[] = ['idle', 'processing', 'error'];
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        setModelStatus(newStatus);
        
        if (newStatus === 'error') {
          setErrors(prev => [...prev, `Model error detected at ${new Date().toLocaleTimeString()}`]);
        }
      }
    };
    
    const interval = setInterval(simulateMetrics, 2000);
    return () => clearInterval(interval);
  }, [sshStatus]);

  return (
    <div className="cyber-panel h-full rounded flex flex-col gap-4 p-4">
      <div className="cyber-scanline"></div>
      
      {/* Header */}
      <StatusHeader />
      
      {/* Connection Status */}
      <ConnectionStatus sshStatus={sshStatus} />
      
      {/* Resources Section */}
      <ResourceMonitor 
        cpuUsage={cpuUsage}
        ramUsage={ramUsage}
        modelStatus={modelStatus}
      />
      
      {/* Error Log */}
      <AlertsPanel errors={errors} />
    </div>
  );
};

export default StatusDashboard;
