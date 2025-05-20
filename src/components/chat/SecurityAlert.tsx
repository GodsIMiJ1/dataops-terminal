
import React, { useState, useEffect } from 'react';
import { ShieldAlert, Skull, Zap } from 'lucide-react';

const SecurityAlert: React.FC = () => {
  const [alertText, setAlertText] = useState('CORP FIREWALL BYPASSED');
  const [blinking, setBlinking] = useState(false);

  // Cycle through different alert messages
  useEffect(() => {
    const messages = [
      'CORP FIREWALL BYPASSED',
      'SECURE TUNNEL ESTABLISHED',
      'ENCRYPTION PROTOCOLS ACTIVE',
      'COUNTER-SURVEILLANCE RUNNING',
      'SIGNAL SCRAMBLING ENABLED'
    ];

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setAlertText(messages[index]);
      setBlinking(true);
      setTimeout(() => setBlinking(false), 500);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-4">
      <div className="cyber-alert flex items-center gap-2 text-sm border border-cyber-red/30 bg-cyber-red/5 p-1 rounded">
        {blinking ?
          <Skull className="w-4 h-4 text-cyber-red animate-pulse" /> :
          <ShieldAlert className="w-4 h-4 text-cyber-red" />
        }
        <div className="font-mono flex items-center gap-1">
          <span className="text-cyber-red font-bold">{alertText}</span>
          <Zap className="w-3 h-3 text-cyber-cyan" />
          <span className="text-xs">GHOST PROTOCOL ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

export default SecurityAlert;
