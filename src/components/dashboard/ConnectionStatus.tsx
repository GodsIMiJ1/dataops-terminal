
import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  sshStatus: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ sshStatus }) => {
  return (
    <div className="flex gap-2 items-center">
      {sshStatus ? (
        <>
          <Wifi className="w-5 h-5 text-green-500 animate-pulse" />
          <span className="text-sm font-medium text-green-500">Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="w-5 h-5 text-red-500 animate-pulse" />
          <span className="text-sm font-medium text-red-500">Disconnected</span>
        </>
      )}
    </div>
  );
};

export default ConnectionStatus;
