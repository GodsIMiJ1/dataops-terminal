
import React from 'react';
import { useChatAI } from '@/hooks/useChatAI';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Plus, Loader2 } from 'lucide-react';
import ActionButton from './ActionButton';

const ChatSidebar: React.FC = () => {
  const { chats, loadChat, createNewChat, currentChatId, loadingChats } = useChatAI();

  if (loadingChats) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-cyber-cyan animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ActionButton 
        onClick={createNewChat}
        className="mb-4 w-full"
        icon={<Plus className="w-4 h-4" />}
      >
        New Chat
      </ActionButton>
      
      <div className="flex-1 overflow-y-auto space-y-2">
        {chats.length === 0 ? (
          <div className="text-center text-sm text-gray-500 font-mono mt-8">
            No chats yet
          </div>
        ) : (
          chats.map((chat) => (
            <div 
              key={chat.id}
              className={`cyber-panel cursor-pointer p-2 rounded ${currentChatId === chat.id ? 'bg-cyber-darkgray border-cyber-cyan' : 'bg-cyber-black/50 border-gray-700 hover:bg-cyber-darkgray/30'}`}
              onClick={() => loadChat(chat.id)}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyber-cyan shrink-0" />
                <div className="truncate font-mono text-sm">
                  {chat.title}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1 font-mono">
                {formatDistanceToNow(new Date(chat.created_at), { addSuffix: true })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
