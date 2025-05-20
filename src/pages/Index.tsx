
import React, { useEffect, useState } from 'react';
import DigitalRain from '@/components/DigitalRain';
import SidePanel from '@/components/SidePanel';
import ChatInterface from '@/components/ChatInterface';
import GlitchText from '@/components/GlitchText';
import StatusIndicator from '@/components/StatusIndicator';
import StatusDashboard from '@/components/StatusDashboard';
import { ShieldAlert, Zap, Skull } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const Index: React.FC = () => {
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
              Bypassing corporate firewalls...
            </div>
            <div className="text-xs font-mono text-cyber-red mt-2">
              <span className="animate-pulse">WARNING:</span> Unauthorized access detected. Activating ghost protocols...
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
      <div className="container mx-auto py-4 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-4 px-2">
          <GlitchText text="R3B3L 4F" className="text-2xl font-bold text-cyber-red" intense />

          <div className="flex items-center gap-2">
            <StatusIndicator status="online" label={isMobile ? "ACTIVE" : "SYSTEM ACTIVE"} />
            {!isMobile && (
              <div className="cyber-panel px-3 py-1 rounded-full flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyber-red" />
                <span className="text-xs font-mono text-cyber-red">LIVE TRUTH TEAM</span>
              </div>
            )}
            <Link
              to="/blackops"
              className="cyber-panel px-3 py-1 rounded-full flex items-center gap-2 bg-cyber-black border-cyber-red hover:bg-cyber-red/20 transition-colors"
              title="Enter BlackOps Terminal"
            >
              <Skull className="w-4 h-4 text-cyber-red" />
              <span className="text-xs font-mono text-cyber-red">{isMobile ? "BLACKOPS" : "BLACKOPS TERMINAL"}</span>
            </Link>
          </div>
        </header>

        {/* Main grid layout - Responsive for mobile and desktop */}
        {isMobile ? (
          // Mobile layout
          <div className="flex flex-col gap-4 flex-1 px-2">
            <div className="flex-1">
              <ChatInterface />
            </div>
          </div>
        ) : (
          // Desktop layout
          <div className="grid grid-cols-12 gap-4 flex-1">
            {/* Left sidebar */}
            <div className="col-span-3">
              <SidePanel side="left" />
            </div>

            {/* Main chat area */}
            <div className="col-span-6">
              <ChatInterface />
            </div>

            {/* Right sidebar */}
            <div className="col-span-3 grid grid-rows-2 gap-4">
              <div className="row-span-1">
                <StatusDashboard />
              </div>
              <div className="row-span-1">
                <SidePanel side="right" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
