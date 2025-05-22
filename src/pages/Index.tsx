
import React, { useEffect, useState } from 'react';
import DigitalRain from '@/components/DigitalRain';
import SidePanel from '@/components/SidePanel';
import ChatInterface from '@/components/ChatInterface';
import GlitchText from '@/components/GlitchText';
import StatusIndicator from '@/components/StatusIndicator';
import StatusDashboard from '@/components/StatusDashboard';
import { ShieldAlert, Zap, Terminal } from 'lucide-react';
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
      <div className="min-h-screen bg-pro-bg dark:bg-pro-bg-dark flex flex-col items-center justify-center">
        <div className="pro-panel rounded-lg p-6 max-w-md w-full">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-8 h-8 text-pro-primary" />
              <h1 className="text-2xl font-bold text-pro-primary">DataOps Terminal</h1>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div className="bg-pro-primary h-full animate-pulse" style={{ width: '75%' }} />
            </div>
            <div className="text-sm text-pro-secondary dark:text-pro-secondary-light animate-pulse">
              Initializing data operations...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pro-bg dark:bg-pro-bg-dark text-pro-text dark:text-pro-text-dark relative overflow-auto">
      {/* Main content */}
      <div className="container mx-auto py-4 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-4 px-2 border-b border-pro-border dark:border-pro-border-dark pb-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-6 h-6 text-pro-primary" />
            <h1 className="text-2xl font-bold text-pro-primary">DataOps Terminal</h1>
          </div>

          <div className="flex items-center gap-2">
            <StatusIndicator status="online" label={isMobile ? "ACTIVE" : "SYSTEM ACTIVE"} />
            {!isMobile && (
              <div className="pro-panel px-3 py-1 rounded-md flex items-center gap-2 bg-white dark:bg-pro-bg-darkPanel border border-pro-border dark:border-pro-border-dark">
                <ShieldAlert className="w-4 h-4 text-pro-secondary" />
                <span className="text-xs text-pro-secondary">Data Protection</span>
              </div>
            )}
            <Link
              to="/terminal"
              className="px-3 py-1 rounded-md flex items-center gap-2 bg-pro-primary text-white hover:bg-pro-primary-dark transition-colors"
              title="Enter DataOps Terminal"
            >
              <Terminal className="w-4 h-4 text-white" />
              <span className="text-xs">{isMobile ? "TERMINAL" : "LAUNCH TERMINAL"}</span>
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
