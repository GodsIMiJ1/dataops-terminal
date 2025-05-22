
import React, { useRef, useEffect } from 'react';
import { Terminal, Zap, Cpu, AlertTriangle } from 'lucide-react';
import { MessageType } from '@/hooks/useChatAI';
import { useIsMobile } from "@/hooks/use-mobile";

interface MessagesListProps {
  messages: MessageType[];
  isLoading: boolean;
}

const MessagesList: React.FC<MessagesListProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="flex-1 w-full overflow-y-auto max-h-[70vh]">
      <div className="p-4 space-y-4">
        {messages.filter(message => message.role !== 'system').map((message) => {
          let messageClass = '';
          let iconComponent = null;

          switch (message.role) {
            case 'user':
              messageClass = 'bg-gray-100 dark:bg-gray-800 border-pro-primary/30 ml-auto';
              iconComponent = <Terminal className="w-4 h-4 text-pro-primary" />;
              break;
            case 'assistant':
              messageClass = 'bg-white dark:bg-gray-900 border-pro-secondary/30';
              iconComponent = <Zap className="w-4 h-4 text-pro-secondary" />;
              break;
            case 'system':
              messageClass = 'bg-gray-50 dark:bg-gray-800 border-yellow-500/30';
              iconComponent = <Cpu className="w-4 h-4 text-yellow-500" />;
              break;
            case 'error':
              messageClass = 'bg-red-50 dark:bg-red-900/20 border-red-500/30';
              iconComponent = <AlertTriangle className="w-4 h-4 text-red-500" />;
              break;
          }

          return (
            <div
              key={message.id}
              className={`pro-panel p-3 rounded-lg shadow-sm ${isMobile ? 'max-w-[95%]' : 'max-w-[85%]'} ${messageClass}`}
            >
              <div className="flex items-start gap-2">
                <div className="mt-1">
                  {iconComponent}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-sm whitespace-pre-wrap break-words text-pro-text dark:text-pro-text-dark">
                    {message.content}
                  </div>
                  <div className="text-xs text-pro-text-muted dark:text-pro-text-mutedDark mt-1">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />

        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-pro-primary">
            <div className="w-2 h-2 bg-pro-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-pro-primary rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
            <div className="w-2 h-2 bg-pro-primary rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesList;
