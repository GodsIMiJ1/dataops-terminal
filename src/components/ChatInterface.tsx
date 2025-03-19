
import React, { useEffect } from 'react';
import { useChatAI } from '@/hooks/useChatAI';
import { usePlayAI } from '@/hooks/usePlayAI';
import ChatHeader from './chat/ChatHeader';
import MessagesList from './chat/MessagesList';
import SecurityAlert from './chat/SecurityAlert';
import ChatInputArea from './chat/ChatInputArea';

const ChatInterface: React.FC = () => {
  const { messages, isLoading, sendMessage, clearMessages } = useChatAI();
  const { speak, isSpeaking } = usePlayAI();

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
