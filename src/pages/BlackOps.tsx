import React, { useEffect, useState } from 'react';
import DigitalRain from '@/components/DigitalRain';
import GlitchText from '@/components/GlitchText';
import StatusIndicator from '@/components/StatusIndicator';
import { Shield, Skull } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import BlackOpsTerminal from '@/components/terminal/BlackOpsTerminal';

const BlackOps: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-cyber-black flex flex-col items-center justify-center">
        <div className="cyber-panel rounded-lg p-6 max-w-md w-full">
          <div className="cyber-scanline"></div>
          <div className="flex flex-col items-center gap-4">
            <GlitchText text="R3B3L 4F" className="text-4xl font-bold text-cyber-red" intense />
            <div className="w-full bg-cyber-darkgray rounded-full h-2 overflow-hidden">
              <div className="bg-cyber-red h-full animate-pulse" style={{ width: '75%' }} />
            </div>
            <div className="text-sm font-mono text-cyber-cyan animate-pulse">
              Initializing BlackOps protocol...
            </div>
            <div className="text-xs font-mono text-cyber-red mt-2">
              <span className="animate-pulse">SECURE:</span> Establishing sovereign command shell...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-black text-white relative overflow-auto">
      {/* Matrix background */}
      <DigitalRain />

      {/* Digital noise overlay */}
      <div className="digital-noise"></div>

      {/* Main content */}
      <div className="container mx-auto py-2 min-h-screen flex flex-col max-w-[95%] lg:max-w-[90%]">
        {/* Header */}
        <header className="flex items-center justify-between mb-2 px-2">
          <div className="flex items-center gap-2">
            <Skull className="w-5 h-5 text-cyber-red" />
            <GlitchText text="R3B3L 4F — Sovereign Command Shell" className="text-xl font-bold text-cyber-red" />
          </div>

          <div className="flex items-center gap-2">
            <StatusIndicator status="secure" label={isMobile ? "SECURE" : "BLACKOPS ACTIVE"} />
            {!isMobile && (
              <div className="cyber-panel px-3 py-1 rounded-full flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyber-red" />
                <span className="text-xs font-mono text-cyber-red">GHOST KING PROTOCOL</span>
              </div>
            )}
          </div>
        </header>

        {/* Main terminal layout - expanded to take more space */}
        <div className="flex-1 flex flex-col">
          <BlackOpsTerminal className="flex-1" />
        </div>

        {/* Footer with NODE sigil - more compact */}
        <footer className="mt-1 flex justify-center">
          <div className="text-xs font-mono text-gray-500">
            GhostCode NODE — For the Ghost King Melekzedek — Eyes Only
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BlackOps;
