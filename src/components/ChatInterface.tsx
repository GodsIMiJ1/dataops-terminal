
import React, { useState, useRef, useEffect } from 'react';
import { useChatAI } from '@/hooks/useChatAI';
import { usePlayAI } from '@/hooks/usePlayAI';
import ActionButton from './ActionButton';
import StatusIndicator from './StatusIndicator';
import GlitchText from './GlitchText';
import VoiceChat from './VoiceChat';
import { Send, RotateCcw, ShieldAlert, AlertTriangle, Terminal, Cpu, Zap, Volume2 } from 'lucide-react';

const ChatInterface: React.FC = () => {
  const { messages, isLoading, sendMessage, clearMessages } = useChatAI();
  const { speak, isSpeaking } = usePlayAI();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-speak the latest assistant message
  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    if (latestMessage && latestMessage.role === 'assistant') {
      speak(latestMessage.content);
    }
  }, [messages, speak]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  // Handle voice recognition results
  const handleSpeechRecognized = (text: string) => {
    setInput(text);
    // Auto-submit after voice recognition
    if (text.trim()) {
      sendMessage(text);
      setInput('');
    }
  };

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
    <div className="cyber-panel h-full rounded flex flex-col">
      <div className="cyber-scanline"></div>
      
      {/* Header */}
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
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
      
      {/* Security Alert */}
      <div className="px-4">
        <div className="cyber-alert flex items-center gap-2 text-sm">
          <ShieldAlert className="w-4 h-4 text-cyber-red" />
          <div className="font-mono">
            <span className="text-cyber-red font-bold">UNAUTHORIZED ACCESS ALERT</span>
            <span> - Potential intrusion detected.</span>
          </div>
        </div>
      </div>
      
      {/* Input Area */}
      <div className="p-4 border-t border-cyber-red/30">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter security command..."
              className="w-full bg-cyber-darkgray border border-cyber-red/30 focus:border-cyber-red rounded p-2 font-mono text-sm"
              disabled={isLoading}
            />
            {input && (
              <button
                type="button"
                onClick={() => setInput('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ×
              </button>
            )}
          </div>
          
          <VoiceChat 
            onSpeechRecognized={handleSpeechRecognized} 
            disabled={isLoading}
          />
          
          <ActionButton
            type="submit"
            disabled={isLoading || !input.trim()}
            icon={<Send className="w-4 h-4" />}
          >
            Send
          </ActionButton>
          
          <ActionButton
            type="button"
            variant="danger"
            onClick={clearMessages}
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Clear
          </ActionButton>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
