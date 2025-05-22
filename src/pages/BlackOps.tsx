import React, { useEffect, useState } from 'react';
import StatusIndicator from '@/components/StatusIndicator';
import { Shield, Database } from 'lucide-react';
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
      <div className="min-h-screen bg-pro-bg-dark flex flex-col items-center justify-center">
        <div className="pro-panel rounded-lg p-6 max-w-md w-full">
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-4xl font-bold text-pro-primary-light">DataOps Terminal</h1>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div className="bg-pro-primary h-full animate-pulse" style={{ width: '75%' }} />
            </div>
            <div className="text-sm text-pro-text-dark animate-pulse">
              Initializing DataOps Terminal...
            </div>
            <div className="text-xs text-pro-text-muted mt-2">
              <span className="animate-pulse">SECURE:</span> Establishing data connection...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pro-bg-dark text-pro-text-dark relative overflow-auto">
      {/* Main content */}
      <div className="container mx-auto py-2 min-h-screen flex flex-col max-w-[95%] lg:max-w-[90%]">
        {/* Header */}
        <header className="flex items-center justify-between mb-2 px-2">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-pro-primary-light" />
            <h1 className="text-xl font-bold text-pro-primary-light">DataOps Terminal — Advanced Data Operations</h1>
          </div>

          <div className="flex items-center gap-2">
            <StatusIndicator status="online" label={isMobile ? "ACTIVE" : "SYSTEM ACTIVE"} />
            {!isMobile && (
              <div className="pro-panel px-3 py-1 rounded-full flex items-center gap-2">
                <Shield className="w-4 h-4 text-pro-primary-light" />
                <span className="text-xs text-pro-primary-light">DATA PROTECTION</span>
              </div>
            )}
          </div>
        </header>

        {/* Main terminal layout - expanded to take more space */}
        <div className="flex-1 flex flex-col">
          <BlackOpsTerminal className="flex-1" />
        </div>

        {/* Footer */}
        <footer className="mt-1 flex justify-center">
          <div className="text-xs text-pro-text-muted">
            DataOps Terminal — Advanced Web Data Operations Platform
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BlackOps;
