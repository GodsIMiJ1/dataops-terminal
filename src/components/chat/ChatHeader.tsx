
import React from 'react';
import { Terminal, Cpu, Volume2 } from 'lucide-react';
import GlitchText from '../GlitchText';
import StatusIndicator from '../StatusIndicator';
import { useSystemMetrics } from '@/hooks/useSystemMetrics';

interface ChatHeaderProps {
  isSpeaking: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ isSpeaking }) => {
  const { modelName, modelStatus } = useSystemMetrics();

  return (
    <div className="p-3 border-b border-pro-border dark:border-pro-border-dark flex items-center justify-between bg-white dark:bg-pro-bg-darkPanel">
      <div className="flex items-center gap-2">
        <Terminal className="w-5 h-5 text-pro-primary" />
        <h2 className="font-bold text-pro-primary">DataOps Assistant</h2>
        {isSpeaking && (
          <Volume2 className="w-4 h-4 text-pro-secondary animate-pulse" />
        )}
      </div>

      <div className="flex items-center gap-3">
        <StatusIndicator
          status={modelStatus === 'idle' ? 'online' : modelStatus === 'processing' ? 'processing' : 'error'}
          label={modelStatus.toUpperCase()}
        />
        <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs border border-pro-border dark:border-pro-border-dark">
          <div className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-pro-secondary" />
            <span className="uppercase text-pro-text-muted dark:text-pro-text-mutedDark">{modelName || 'NO MODEL'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
