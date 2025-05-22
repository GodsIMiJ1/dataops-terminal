
import React from 'react';
import { Server } from 'lucide-react';

const StatusHeader: React.FC = () => {
  return (
    <div className="pro-header">
      <Server className="w-4 h-4 text-pro-primary mr-2" />
      <h2 className="text-lg font-medium">Platform Status</h2>
    </div>
  );
};

export default StatusHeader;
