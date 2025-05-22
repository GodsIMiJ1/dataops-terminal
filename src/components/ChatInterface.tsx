
import React, { useEffect, useState } from 'react';
import { useChatAI } from '@/hooks/useChatAI';
import { usePlayAI } from '@/hooks/usePlayAI';
import { useSystemMetrics } from '@/hooks/useSystemMetrics';
import ChatHeader from './chat/ChatHeader';
import MessagesList from './chat/MessagesList';
import SecurityAlert from './chat/SecurityAlert';
import ChatInputArea from './chat/ChatInputArea';
import { Shield, ShieldAlert } from 'lucide-react';
import { isOpenAIConfigured } from '@/services/OpenAIService';
import { isSupabaseConfigured } from '@/services/SupabaseService';

const ChatInterface: React.FC = () => {
  const { messages, isLoading, sendMessage, clearMessages, error } = useChatAI();
  const { speak, isSpeaking } = usePlayAI();
  const { modelStatus } = useSystemMetrics();
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [persistenceEnabled, setPersistenceEnabled] = useState<boolean>(false);

  // Check OpenAI API configuration
  useEffect(() => {
    const checkOpenAIConnection = () => {
      const isConfigured = isOpenAIConfigured();
      setApiConnected(isConfigured);

      if (isConfigured) {
        console.log('OpenAI API is configured');
      } else {
        console.error('OpenAI API key is not configured');
      }
    };

    checkOpenAIConnection();
  }, []);

  // Check Supabase configuration
  useEffect(() => {
    const checkSupabaseConnection = () => {
      const isConfigured = isSupabaseConfigured();
      setPersistenceEnabled(isConfigured);

      if (isConfigured) {
        console.log('Supabase is configured for persistence');
      } else {
        console.error('Supabase is not configured for persistence');
      }
    };

    checkSupabaseConnection();
  }, []);

  // Auto-speak the latest assistant message
  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    if (latestMessage && latestMessage.role === 'assistant') {
      speak(latestMessage.content);
    }
  }, [messages, speak]);

  return (
    <div className="pro-panel min-h-full rounded flex flex-col overflow-hidden">
      {/* Header */}
      <ChatHeader isSpeaking={isSpeaking} />

      {/* API Status Indicator */}
      <div className="px-4 py-1 flex items-center gap-2 border-b border-pro-border dark:border-pro-border-dark bg-gray-50 dark:bg-gray-800">
        {apiConnected === null ? (
          <div className="text-xs text-pro-text-muted dark:text-pro-text-mutedDark flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            Checking OpenAI API configuration...
          </div>
        ) : apiConnected ? (
          <div className="text-xs text-pro-text-muted dark:text-pro-text-mutedDark flex items-center gap-2">
            <Shield className="w-3 h-3 text-green-500" />
            Connected to OpenAI API (GPT-4o)
            {persistenceEnabled && (
              <span className="ml-2 text-xs text-pro-accent">
                • Device Persistence Enabled
              </span>
            )}
          </div>
        ) : (
          <div className="text-xs text-red-500 flex items-center gap-2">
            <ShieldAlert className="w-3 h-3 animate-pulse" />
            OpenAI API not configured - using fallback responses
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
