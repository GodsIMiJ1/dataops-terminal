
import React from 'react';
import StatusHeader from '@/components/dashboard/StatusHeader';
import ConnectionStatus from '@/components/dashboard/ConnectionStatus';
import ResourceMonitor from '@/components/dashboard/ResourceMonitor';
import { useSystemMetrics } from '@/hooks/useSystemMetrics';

const StatusDashboard: React.FC = () => {
  const { cpuUsage, memoryUsage, storageUsage, modelName, modelStatus } = useSystemMetrics();

  return (
    <div className="pro-panel h-full rounded flex flex-col gap-4 p-4">
      {/* Header */}
      <StatusHeader />

      {/* Connection Status */}
      <ConnectionStatus sshStatus={modelStatus !== 'error'} />

      {/* Resources Section */}
      <ResourceMonitor
        cpuUsage={cpuUsage}
        ramUsage={memoryUsage}
        modelStatus={modelStatus}
        modelName={modelName}
        storageUsage={storageUsage}
      />
    </div>
  );
};

export default StatusDashboard;
