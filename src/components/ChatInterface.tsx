
import React, { useEffect, useState } from 'react';
import { useChatAI } from '@/hooks/useChatAI';
import { usePlayAI } from '@/hooks/usePlayAI';
import { useSystemMetrics } from '@/hooks/useSystemMetrics';
import ChatHeader from './chat/ChatHeader';
import MessagesList from './chat/MessagesList';
import SecurityAlert from './chat/SecurityAlert';
import ChatInputArea from './chat/ChatInputArea';
import { Shield, ShieldAlert } from 'lucide-react';

const ChatInterface: React.FC = () => {
  const { messages, isLoading, sendMessage, clearMessages, error } = useChatAI();
  const { speak, isSpeaking } = usePlayAI();
  const { modelStatus } = useSystemMetrics();
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);

  // Using OpenAI API now
  useEffect(() => {
    // We're using OpenAI API now, so we'll just assume it's connected
    // In a production app, you might want to make a test request to verify
    setApiConnected(true);

    // No need to check connection periodically for OpenAI
    return () => {};
  }, []);

  // Auto-speak the latest assistant message
  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    if (latestMessage && latestMessage.role === 'assistant') {
      speak(latestMessage.content);
    }
  }, [messages, speak]);

  return (
    <div className="cyber-panel h-full rounded flex flex-col">
      <div className="cyber-scanline"></div>

      {/* Header */}
      <ChatHeader isSpeaking={isSpeaking} />

      {/* API Status Indicator */}
      <div className="px-4 py-1 flex items-center gap-2 border-b border-cyber-red/30">
        {apiConnected === null ? (
          <div className="text-xs font-mono text-cyber-cyan flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            Checking LM Studio connection...
          </div>
        ) : apiConnected ? (
          <div className="text-xs font-mono text-cyber-cyan flex items-center gap-2">
            <Shield className="w-3 h-3 text-green-500" />
            Connected to OpenAI API
          </div>
        ) : (
          <div className="text-xs font-mono text-cyber-red flex items-center gap-2">
            <ShieldAlert className="w-3 h-3 animate-pulse" />
            OpenAI API not connected - using fallback responses
          </div>
        )}
      </div>

      {/* Messages Area */}
      <MessagesList messages={messages} isLoading={isLoading} />

      {/* Security Alert */}
      <SecurityAlert />

      {/* Input Area */}
      <ChatInputArea
        onSendMessage={sendMessage}
        onClearMessages={clearMessages}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChatInterface;
