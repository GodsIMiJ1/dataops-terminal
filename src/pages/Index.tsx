
import React, { useEffect, useState } from 'react';
import DigitalRain from '@/components/DigitalRain';
import SidePanel from '@/components/SidePanel';
import ChatInterface from '@/components/ChatInterface';
import GlitchText from '@/components/GlitchText';
import StatusIndicator from '@/components/StatusIndicator';
import StatusDashboard from '@/components/StatusDashboard';
import { ShieldAlert, Zap } from 'lucide-react';

const Index: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

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
              Initializing secure interface...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-black text-white relative overflow-hidden">
      {/* Matrix background */}
      <DigitalRain />
      
      {/* Digital noise overlay */}
      <div className="digital-noise"></div>
      
      {/* Main content */}
      <div className="container mx-auto py-4 h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-4">
          <GlitchText text="R3B3L 4F" className="text-2xl font-bold text-cyber-red" intense />
          
          <div className="flex items-center gap-4">
            <StatusIndicator status="online" label="SYSTEM ACTIVE" />
            <div className="cyber-panel px-3 py-1 rounded-full flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyber-red" />
              <span className="text-xs font-mono text-cyber-red">LIVE TRUTH TEAM</span>
            </div>
          </div>
        </header>
        
        {/* Main grid layout - Updated to include StatusDashboard */}
        <div className="grid grid-cols-12 gap-4 flex-1">
          {/* Left sidebar */}
          <div className="col-span-3">
            <SidePanel side="left" />
          </div>
          
          {/* Main chat area */}
          <div className="col-span-6">
            <ChatInterface />
          </div>
          
          {/* Right sidebar - Updated to use both SidePanel and StatusDashboard */}
          <div className="col-span-3 grid grid-rows-2 gap-4">
            <div className="row-span-1">
              <StatusDashboard />
            </div>
            <div className="row-span-1">
              <SidePanel side="right" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
