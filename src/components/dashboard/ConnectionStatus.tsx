
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
  );
};

export default ConnectionStatus;
