
import React from 'react';
import { ShieldAlert } from 'lucide-react';

const SecurityAlert: React.FC = () => {
  return (
    <div className="px-4">
      <div className="cyber-alert flex items-center gap-2 text-sm">
        <ShieldAlert className="w-4 h-4 text-cyber-red" />
        <div className="font-mono">
          <span className="text-cyber-red font-bold">UNAUTHORIZED ACCESS ALERT</span>
          <span> - Potential intrusion detected.</span>
        </div>
      </div>
    </div>
  );
};

export default SecurityAlert;
