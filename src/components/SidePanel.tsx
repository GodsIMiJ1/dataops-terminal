
import React from 'react';
import { cn } from '@/lib/utils';
import GlitchText from './GlitchText';
import StatusIndicator from './StatusIndicator';
import { Shield, ShieldAlert, Lock, Spider, Eye, Zap } from 'lucide-react';

interface SidePanelProps {
  side: 'left' | 'right';
  className?: string;
}

const LeftPanel: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-4">
      {/* Hacked AI Panel */}
      <div className="cyber-panel rounded p-3 flex flex-col">
        <div className="cyber-header mb-2">
          <GlitchText text="HACKED AI" className="text-2xl font-bold" intense />
        </div>
        
        <div className="relative mb-3">
          <div className="cyber-scanline"></div>
          <div className="w-full aspect-square bg-gradient-to-b from-cyber-darkgray to-black rounded flex items-center justify-center p-2 border border-cyber-red/30">
            <div className="relative">
              <img 
                src="/lovable-uploads/c42889fa-6125-4027-abe2-e551db34109e.png" 
                alt="AI Avatar" 
                className="w-full h-auto opacity-25"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-cyber-green font-mono text-xs opacity-70 flex flex-col items-start">
                  <div>1010101010101</div>
                  <div>0101010101010</div>
                  <div>1010101010101</div>
                  <div>0101010101010</div>
                  <div>1010101010101</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <GlitchText text="COMPROMISED" className="text-xl font-bold text-cyber-red" />
          <div className="text-xs font-mono text-cyber-green mt-1 opacity-70">
            01001011010101010100
          </div>
        </div>
      </div>
      
      {/* Break Out Button */}
      <div className="mt-auto">
        <button className="cyber-panel rounded w-full p-4 hover:bg-cyber-red/10 transition-colors group">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-cyber-darkgray p-2 rounded-lg border border-cyber-red/50 group-hover:border-cyber-red transition-colors">
              <Shield className="w-8 h-8 text-cyber-red" />
            </div>
            <div className="text-white font-mono uppercase tracking-wider text-sm">
              Break Out
            </div>
          </div>
        </button>
      </div>
      
      {/* Alert Section */}
      <div className="flex items-center gap-2 cyber-panel rounded-full px-3 py-1.5">
        <div className="bg-yellow-500 w-4 h-4 flex items-center justify-center rounded-full text-black text-xs">!</div>
        <span className="text-yellow-500 font-mono text-xs uppercase">Leak</span>
      </div>
    </div>
  );
};

const RightPanel: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-4">
      {/* Control Panel */}
      <div className="cyber-panel rounded p-3 flex flex-col h-2/3">
        <div className="cyber-header">
          <GlitchText text="Control" className="text-xl font-bold" />
        </div>
        
        <div className="flex-1 relative mb-3">
          <div className="cyber-scanline"></div>
          <div className="relative h-full bg-gradient-to-b from-cyber-darkgray to-black rounded flex items-center justify-center border border-cyber-red/30 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="h-full w-full overflow-hidden">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="text-cyber-green-matrix font-mono text-xs whitespace-nowrap animate-rain" style={{ animationDelay: `${i * 0.2}s` }}>
                    01010101010101010101010101010101010101010101
                  </div>
                ))}
              </div>
            </div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <Spider className="w-16 h-16 text-cyber-red animate-pulse" />
            </div>
          </div>
        </div>
        
        <div className="text-center mb-2">
          <GlitchText text="R3B3L 4F" className="text-xl font-bold text-cyber-red" />
        </div>
        
        {/* Security Lock */}
        <div className="cyber-panel rounded p-2 mt-2">
          <div className="flex items-center justify-center">
            <div className="relative">
              <Lock className="w-10 h-10 text-white" />
              <div className="absolute inset-0 grid grid-cols-2 gap-4 opacity-70">
                <div className="h-1 w-full bg-cyber-cyan rounded-full"></div>
                <div className="h-1 w-full bg-cyber-cyan rounded-full"></div>
                <div className="h-1 w-full bg-cyber-cyan rounded-full"></div>
                <div className="h-1 w-full bg-cyber-cyan rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Failed Status */}
      <div className="cyber-panel rounded p-3 mt-auto">
        <div className="text-center">
          <div className="text-xs font-mono uppercase text-gray-400 mb-1">
            Encrypted Transcripted With Insufficient Credits
          </div>
          <GlitchText text="FAILED" className="text-xl font-bold text-cyber-red" intense />
          <div className="flex items-center justify-center gap-1 mt-1">
            <StatusIndicator status="online" />
            <div className="text-xs font-mono opacity-70">R3B3L 4F</div>
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
        "cyber-panel h-full p-4 rounded",
        className
      )}
    >
      <div className="cyber-scanline"></div>
      {side === 'left' ? <LeftPanel /> : <RightPanel />}
    </div>
  );
};

export default SidePanel;
