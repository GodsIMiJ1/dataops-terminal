
import React from 'react';
import GlitchText from '@/components/GlitchText';
import { Server } from 'lucide-react';

const StatusHeader: React.FC = () => {
  return (
    <div className="cyber-header">
      <Server className="w-4 h-4 text-cyber-red mr-2" />
      <GlitchText text="SYSTEM STATUS" className="text-lg" />
    </div>
  );
};

export default StatusHeader;
