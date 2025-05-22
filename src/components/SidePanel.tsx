
import React from 'react';
import { cn } from '@/lib/utils';
import StatusIndicator from './StatusIndicator';
import { Shield, ShieldAlert, Lock, Database, Server, Zap, BarChart } from 'lucide-react';

interface SidePanelProps {
  side: 'left' | 'right';
  className?: string;
}

const LeftPanel: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-4">
      {/* Data Analytics Panel */}
      <div className="pro-panel rounded p-3 flex flex-col">
        <div className="pro-header mb-2">
          <BarChart className="w-4 h-4 mr-2 text-pro-primary" />
          <h2 className="text-lg font-medium">Data Analytics</h2>
        </div>

        <div className="relative mb-3">
          <div className="w-full aspect-square bg-white dark:bg-gray-800 rounded flex items-center justify-center p-2 border border-pro-border dark:border-pro-border-dark">
            <div className="relative">
              <img
                src="/dataops-icon.svg"
                alt="DataOps Logo"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-medium text-pro-primary">Connected</h3>
          <div className="text-xs text-pro-text-muted dark:text-pro-text-mutedDark mt-1">
            Data pipeline active
          </div>
        </div>
      </div>

      {/* Resources Button */}
      <div className="mt-auto">
        <a
          href="https://thewitnesshall.com"
          target="_blank"
          rel="noopener noreferrer"
          className="pro-panel rounded w-full p-4 hover:bg-pro-primary/5 transition-colors group block"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-pro-border dark:border-pro-border-dark group-hover:border-pro-primary transition-colors">
              <Shield className="w-8 h-8 text-pro-primary" />
            </div>
            <div className="text-pro-text dark:text-pro-text-dark font-medium uppercase tracking-wider text-sm">
              Resources
            </div>
          </div>
        </a>
      </div>

      {/* Status Section */}
      <div className="flex items-center gap-2 pro-panel rounded-full px-3 py-1.5">
        <div className="bg-green-500 w-4 h-4 flex items-center justify-center rounded-full text-white text-xs">✓</div>
        <span className="text-pro-text-muted dark:text-pro-text-mutedDark text-xs uppercase font-medium">Active</span>
      </div>
    </div>
  );
};

const RightPanel: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-4">
      {/* Data Security Panel */}
      <div className="pro-panel rounded p-3 flex flex-col h-2/3">
        <div className="pro-header">
          <Lock className="w-4 h-4 mr-2 text-pro-primary" />
          <h2 className="text-lg font-medium">Data Security</h2>
        </div>

        <a
          href="https://temple-of-screaming-walls.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 relative mb-3 group"
        >
          <div className="relative h-full bg-white dark:bg-gray-800 rounded flex items-center justify-center border border-pro-border dark:border-pro-border-dark overflow-hidden group-hover:border-pro-primary transition-colors">
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <Shield className="w-16 h-16 text-pro-primary group-hover:text-pro-secondary transition-colors" />
            </div>
          </div>
        </a>

        <div className="text-center mb-2">
          <h3 className="text-lg font-medium text-pro-primary">Data Protection</h3>
        </div>

        {/* Security Status */}
        <div className="pro-panel rounded p-2 mt-2">
          <div className="flex items-center justify-center">
            <div className="relative">
              <Lock className="w-10 h-10 text-pro-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Panel */}
      <div className="pro-panel rounded p-3 mt-auto">
        <div className="text-center">
          <div className="text-xs text-pro-text-muted dark:text-pro-text-mutedDark mb-1">
            System Status
          </div>
          <h3 className="text-lg font-medium text-green-500">ACTIVE</h3>
          <div className="flex items-center justify-center gap-1 mt-1">
            <StatusIndicator status="online" />
            <div className="text-xs text-pro-text-muted dark:text-pro-text-mutedDark">DataOps Terminal</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SidePanel: React.FC<SidePanelProps> = ({ side, className }) => {
  return (
    <div
      className={cn(
        "pro-panel h-full p-4 rounded",
        className
      )}
    >
      {side === 'left' ? <LeftPanel /> : <RightPanel />}
    </div>
  );
};

export default SidePanel;
