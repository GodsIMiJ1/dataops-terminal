
import React from 'react';
import { Terminal, Cpu, Volume2 } from 'lucide-react';
import GlitchText from '../GlitchText';
import StatusIndicator from '../StatusIndicator';

interface ChatHeaderProps {
  isSpeaking: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ isSpeaking }) => {
  return (
    <div className="p-3 border-b border-cyber-red/30 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Terminal className="w-5 h-5 text-cyber-red" />
        <GlitchText text="R3B3L 4F" className="font-bold text-cyber-red" />
        {isSpeaking && (
          <Volume2 className="w-4 h-4 text-cyber-cyan animate-pulse" />
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <StatusIndicator status="online" label="ACTIVE" />
        <div className="bg-cyber-darkgray px-2 py-1 rounded text-xs font-mono">
          <div className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-cyber-cyan" />
            <span>DEEPSEEKR1-14B</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
