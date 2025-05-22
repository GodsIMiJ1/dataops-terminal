
import React from 'react';
import { Mic, MicOff, Volume2, Volume } from 'lucide-react';
import ActionButton from './ActionButton';
import { cn } from '@/lib/utils';
import { usePlayAI } from '@/hooks/usePlayAI';

interface VoiceChatProps {
  onSpeechRecognized: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

const VoiceChat: React.FC<VoiceChatProps> = ({
  onSpeechRecognized,
  disabled = false,
  className
}) => {
  const {
    startListening,
    stopListening,
    isListening,
    isSpeaking,
    error
  } = usePlayAI({ onSpeechRecognized });

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <ActionButton
        type="button"
        variant={isListening ? "danger" : "secondary"}
        onClick={handleToggleMic}
        disabled={disabled}
        icon={isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        className={isListening ? "animate-pulse" : ""}
      >
        {isListening ? "Stop" : "Voice"}
      </ActionButton>

      {isSpeaking && (
        <div className="flex items-center text-pro-secondary">
          <Volume2 className="w-4 h-4 animate-pulse" />
        </div>
      )}

      {error && (
        <div className="text-xs text-red-500">
          {error}
        </div>
      )}
    </div>
  );
};

export default VoiceChat;
