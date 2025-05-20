
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

  // Using Ollama API
  useEffect(() => {
    // Check if Ollama is running locally
    const checkOllamaConnection = async () => {
      try {
        const response = await fetch('http://localhost:11434/api/version');
        if (response.ok) {
          setApiConnected(true);
          console.log('Ollama is running locally');
        } else {
          setApiConnected(false);
          console.error('Ollama API returned an error');
        }
      } catch (error) {
        setApiConnected(false);
        console.error('Failed to connect to Ollama:', error);
      }
    };

    checkOllamaConnection();

    // Check connection periodically
    const interval = setInterval(checkOllamaConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-speak the latest assistant message
  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    if (latestMessage && latestMessage.role === 'assistant') {
      speak(latestMessage.content);
    }
  }, [messages, speak]);

  return (
    <div className="cyber-panel min-h-full rounded flex flex-col overflow-hidden">
      <div className="cyber-scanline"></div>

      {/* Header */}
      <ChatHeader isSpeaking={isSpeaking} />

      {/* API Status Indicator */}
      <div className="px-4 py-1 flex items-center gap-2 border-b border-cyber-red/30">
        {apiConnected === null ? (
          <div className="text-xs font-mono text-cyber-cyan flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            Checking Ollama API connection...
          </div>
        ) : apiConnected ? (
          <div className="text-xs font-mono text-cyber-cyan flex items-center gap-2">
            <Shield className="w-3 h-3 text-green-500" />
            Connected to Ollama API (r3b3l-4f-r1)
          </div>
        ) : (
          <div className="text-xs font-mono text-cyber-red flex items-center gap-2">
            <ShieldAlert className="w-3 h-3 animate-pulse" />
            Ollama not running - using fallback responses
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
