
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  created_at: string;
}

interface UseChatAIReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  saveChat: () => Promise<void>;
  loadChat: (chatId: string) => Promise<void>;
  createNewChat: () => void;
  chats: Chat[];
  currentChatId: string | null;
  loadingChats: boolean;
}

export const useChatAI = (): UseChatAIReturn => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'system-1',
      role: 'system',
      content: 'R3B3L 4F initialized. Cybersecurity interface active. Ready to assist with security analysis and ethical hacking tasks.',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [loadingChats, setLoadingChats] = useState<boolean>(false);
  const { user } = useAuth();

  // Fetch user's chats
  useEffect(() => {
    const fetchChats = async () => {
      if (!user) return;
      
      setLoadingChats(true);
      try {
        const { data, error } = await supabase
          .from('rebel_chats')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setChats(data as Chat[]);

        // If no current chat and there are chats, set the first one as current
        if (!currentChatId && data.length > 0) {
          setCurrentChatId(data[0].id);
          await loadMessagesForChat(data[0].id);
        } else if (!currentChatId) {
          // If no chats exist, create a new one
          createNewChat();
        }
      } catch (err) {
        console.error('Error fetching chats:', err);
        toast.error('Failed to load chats');
      } finally {
        setLoadingChats(false);
      }
    };
    
    fetchChats();
  }, [user]);

  // Load messages for a specific chat
  const loadMessagesForChat = async (chatId: string) => {
    if (!user || !chatId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('rebel_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('timestamp', { ascending: true });
        
      if (error) throw error;
      
      if (data.length > 0) {
        const formattedMessages = data.map((msg) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant' | 'system' | 'error',
          content: msg.content,
          timestamp: new Date(msg.timestamp)
        }));
        
        setMessages(formattedMessages);
      } else {
        // If no messages, show the system welcome message
        setMessages([{
          id: 'system-1',
          role: 'system',
          content: 'R3B3L 4F initialized. Cybersecurity interface active. Ready to assist with security analysis and ethical hacking tasks.',
          timestamp: new Date()
        }]);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  // Simulated AI response
  const getAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate different responses based on input
    if (userMessage.toLowerCase().includes('vulnerability')) {
      return 'Vulnerability scan initiated. Analyzing system for potential security weaknesses. Several CVEs detected in outdated packages. Recommend immediate patching.';
    } else if (userMessage.toLowerCase().includes('password')) {
      return 'Password security analysis complete. Several weak credentials detected. Implementing zero-trust architecture and multi-factor authentication recommended.';
    } else if (userMessage.toLowerCase().includes('encrypt')) {
      return 'Encryption protocols analyzed. Using AES-256 with proper key management recommended for sensitive data. Quantum-resistant algorithms should be considered for long-term storage.';
    } else if (userMessage.toLowerCase().includes('network')) {
      return 'Network analysis complete. Detected 3 unauthorized access attempts. IP addresses logged and blocked. Recommend implementing additional firewall rules and IDS/IPS solutions.';
    } else if (userMessage.toLowerCase().includes('help')) {
      return 'R3B3L 4F can assist with: vulnerability scanning, penetration testing, secure coding practices, encryption, network security, social engineering prevention, and security architecture design.';
    } else {
      return `Analysis complete. ${Math.floor(Math.random() * 3) + 1} potential security concerns identified. Remediation strategies calculated. Awaiting command for detailed report.`;
    }
  };

  // Create a new chat if none exists
  const createNewChat = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('rebel_chats')
        .insert([
          { 
            title: 'New Chat',
            user_id: user.id
          }
        ])
        .select();
        
      if (error) throw error;
      
      const newChat = data[0];
      setCurrentChatId(newChat.id);
      setChats(prev => [newChat, ...prev]);
      
      // Reset messages to just the system welcome
      setMessages([{
        id: 'system-1',
        role: 'system',
        content: 'R3B3L 4F initialized. Cybersecurity interface active. Ready to assist with security analysis and ethical hacking tasks.',
        timestamp: new Date()
      }]);
      
      toast.success('New chat created');
    } catch (err) {
      console.error('Error creating new chat:', err);
      toast.error('Failed to create new chat');
    }
  }, [user]);

  // Save message to database
  const saveMessageToDatabase = async (message: Message) => {
    if (!user || !currentChatId) return;
    
    try {
      const { error } = await supabase
        .from('rebel_messages')
        .insert([
          {
            chat_id: currentChatId,
            content: message.content,
            role: message.role,
            timestamp: message.timestamp.getTime()
          }
        ]);
        
      if (error) throw error;
    } catch (err) {
      console.error('Error saving message:', err);
      // Continue even if there's an error - the message is already in the UI
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !user) return;
    
    // Ensure we have a chat to save to
    if (!currentChatId) {
      await createNewChat();
    }
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    
    // Save user message to database
    await saveMessageToDatabase(userMessage);
    
    try {
      const response = await getAIResponse(content);
      
      const aiMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Save AI message to database
      await saveMessageToDatabase(aiMessage);
      
      // Update chat title if it's a new chat
      if (currentChatId && chats.find(c => c.id === currentChatId)?.title === 'New Chat') {
        const truncatedContent = content.length > 30 ? content.substring(0, 30) + '...' : content;
        
        const { error } = await supabase
          .from('rebel_chats')
          .update({ title: truncatedContent })
          .eq('id', currentChatId);
          
        if (!error) {
          setChats(prev => prev.map(chat => 
            chat.id === currentChatId ? { ...chat, title: truncatedContent } : chat
          ));
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      setError(errorMessage);
      
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'error',
        content: `Error: ${errorMessage}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMsg]);
      
      // Save error message to database
      await saveMessageToDatabase(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [user, currentChatId, chats, createNewChat]);

  const clearMessages = useCallback(() => {
    setMessages([{
      id: 'system-1',
      role: 'system',
      content: 'R3B3L 4F initialized. Cybersecurity interface active. Ready to assist with security analysis and ethical hacking tasks.',
      timestamp: new Date()
    }]);
    setError(null);
  }, []);

  const saveChat = useCallback(async () => {
    if (!user || !currentChatId || messages.length <= 1) {
      toast.error('No messages to save');
      return;
    }
    
    try {
      // The chat is already saved as we go, so we just update the timestamp
      const { error } = await supabase
        .from('rebel_chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentChatId);
        
      if (error) throw error;
      
      toast.success('Chat saved successfully');
    } catch (err) {
      console.error('Error saving chat:', err);
      toast.error('Failed to save chat');
    }
  }, [user, currentChatId, messages]);

  const loadChat = useCallback(async (chatId: string) => {
    if (!user) return;
    
    setCurrentChatId(chatId);
    await loadMessagesForChat(chatId);
  }, [user]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    saveChat,
    loadChat,
    createNewChat,
    chats,
    currentChatId,
    loadingChats
  };
};
