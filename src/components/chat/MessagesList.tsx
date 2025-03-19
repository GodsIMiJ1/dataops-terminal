
import React, { useRef, useEffect } from 'react';
import { Terminal, Zap, Cpu, AlertTriangle } from 'lucide-react';
import { MessageType } from '@/hooks/useChatAI';
import { ScrollArea } from "@/components/ui/scroll-area";

interface MessagesListProps {
  messages: MessageType[];
  isLoading: boolean;
}

const MessagesList: React.FC<MessagesListProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    <ScrollArea className="flex-1 h-[calc(100%-140px)]">
      <div className="p-4 space-y-4">
        {messages.map((message) => {
          let messageClass = '';
          let iconComponent = null;
          
          switch (message.role) {
            case 'user':
              messageClass = 'bg-cyber-darkgray border-cyber-cyan/30 ml-auto';
              iconComponent = <Terminal className="w-4 h-4 text-cyber-cyan" />;
              break;
            case 'assistant':
              messageClass = 'bg-cyber-darkgray/50 border-cyber-red/30';
              iconComponent = <Zap className="w-4 h-4 text-cyber-red" />;
              break;
            case 'system':
              messageClass = 'bg-cyber-darkgray/30 border-yellow-600/30';
              iconComponent = <Cpu className="w-4 h-4 text-yellow-600" />;
              break;
            case 'error':
              messageClass = 'bg-cyber-red/10 border-cyber-red/50';
              iconComponent = <AlertTriangle className="w-4 h-4 text-cyber-red" />;
              break;
          }
          
          return (
            <div 
              key={message.id}
              className={`cyber-panel p-3 rounded max-w-[85%] ${messageClass}`}
            >
              <div className="flex items-start gap-2">
                <div className="mt-1">
                  {iconComponent}
                </div>
                <div>
                  <div className="font-mono text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 font-mono">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
        
        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-cyber-cyan">
            <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
            <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default MessagesList;
