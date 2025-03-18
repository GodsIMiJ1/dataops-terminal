
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import StatusIndicator from '@/components/StatusIndicator';
import GlitchText from '@/components/GlitchText';
import { Cpu, Memory, Wifi, WifiOff, AlertCircle, HardDrive, Bot, Server } from 'lucide-react';

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
    <div className="cyber-panel h-full rounded flex flex-col gap-4 p-4">
      <div className="cyber-scanline"></div>
      
      {/* Header */}
      <div className="cyber-header">
        <Server className="w-4 h-4 text-cyber-red mr-2" />
        <GlitchText text="SYSTEM STATUS" className="text-lg" />
      </div>
      
      {/* Connection Status */}
      <div className="flex gap-2 items-center">
        {sshStatus ? (
          <>
            <Wifi className="w-5 h-5 text-cyber-green animate-pulse" />
            <span className="text-sm font-mono text-cyber-green">CONNECTED</span>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5 text-cyber-red animate-pulse" />
            <span className="text-sm font-mono text-cyber-red">DISCONNECTED</span>
          </>
        )}
      </div>
      
      {/* Resources Section */}
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
              <Memory className="w-4 h-4 text-cyber-cyan" />
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
              <Bot className="w-4 h-4 text-cyber-cyan" />
              <span className="text-xs font-mono">DEEPSEEK-14B</span>
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
            <span className="text-xs font-mono font-bold text-cyber-green">38%</span>
          </div>
          <Progress value={38} className="h-1.5 bg-cyber-darkgray">
            <div className="h-full bg-cyber-green transition-all" style={{ width: '38%' }} />
          </Progress>
        </div>
      </div>
      
      {/* Error Log */}
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
    </div>
  );
};

export default StatusDashboard;
