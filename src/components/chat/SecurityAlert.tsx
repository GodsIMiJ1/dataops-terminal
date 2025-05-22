
import React, { useState, useEffect } from 'react';
import { ShieldAlert, Skull, Zap } from 'lucide-react';

const SecurityAlert: React.FC = () => {
  const [alertText, setAlertText] = useState('SECURE CONNECTION ESTABLISHED');
  const [blinking, setBlinking] = useState(false);

  // Cycle through different alert messages
  useEffect(() => {
    const messages = [
      'SECURE CONNECTION ESTABLISHED',
      'DATA PROTECTION ENABLED',
      'ENCRYPTION PROTOCOLS ACTIVE',
      'PRIVACY SAFEGUARDS RUNNING',
      'SECURE DATA HANDLING ACTIVE'
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
      <div className="pro-alert flex items-center gap-2 text-sm border-l-4 border-pro-primary bg-pro-primary/5 p-2 rounded">
        {blinking ?
          <ShieldAlert className="w-4 h-4 text-pro-primary animate-pulse" /> :
          <ShieldAlert className="w-4 h-4 text-pro-primary" />
        }
        <div className="flex items-center gap-1">
          <span className="text-pro-primary font-medium">{alertText}</span>
          <Zap className="w-3 h-3 text-pro-secondary" />
          <span className="text-xs text-pro-text-muted dark:text-pro-text-mutedDark">SECURE MODE ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

export default SecurityAlert;
