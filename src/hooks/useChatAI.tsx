import { useState, useCallback, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { getOpenAIResponse, getFallbackResponse, isOpenAIConfigured } from '@/services/OpenAIService';
import {
  saveChatMessage,
  loadChatMessages,
  clearChatMessages,
  isSupabaseConfigured,
  registerDeviceSession,
  getOrGenerateDeviceId
} from '@/services/SupabaseService';

export interface MessageType {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  timestamp: Date;
}

interface UseChatAIReturn {
  messages: MessageType[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

// System prompt for DataOps Terminal
const SYSTEM_PROMPT = 'You are the DataOps Terminal Assistant, a professional AI designed to help users with data operations, web scraping, and data analysis. Provide clear, accurate guidance on data collection, processing, and visualization with a focus on professional best practices. Your responses should be technical but accessible, emphasizing data ethics, efficiency, and modern methodologies. Maintain a helpful, professional tone while delivering practical solutions to data challenges.';

// Debug environment variables
console.log("Environment variables available:", Object.keys(import.meta.env));

export const useChatAI = (): UseChatAIReturn => {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: 'system-1',
      role: 'system',
      content: SYSTEM_PROMPT,
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize chat history from Supabase on component mount
  useEffect(() => {
    const initializeChat = async () => {
      if (isSupabaseConfigured()) {
        try {
          // Register device session
          const deviceId = getOrGenerateDeviceId();
          await registerDeviceSession(deviceId);

          // Load chat messages
          const loadedMessages = await loadChatMessages();

          if (loadedMessages.length > 0) {
            // Check if system message exists
            const hasSystemMessage = loadedMessages.some(msg => msg.role === 'system');

            if (!hasSystemMessage) {
              // Add system message if it doesn't exist
              loadedMessages.unshift({
                id: 'system-1',
                role: 'system',
                content: SYSTEM_PROMPT,
                timestamp: new Date()
              });
            }

            setMessages(loadedMessages);
            console.log('Chat history loaded from Supabase');
          }
        } catch (err) {
          console.error('Failed to initialize chat history:', err);
          // Continue with default messages
        }
      } else {
        console.log('Supabase is not configured, using local state only');
      }

      setIsInitialized(true);
    };

    initializeChat();
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: MessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Save user message to Supabase
    if (isSupabaseConfigured()) {
      try {
        await saveChatMessage(userMessage);
      } catch (err) {
        console.error('Failed to save user message to Supabase:', err);
        // Continue with local state
      }
    }

    try {
      // Check if OpenAI API is configured
      if (isOpenAIConfigured()) {
        console.log("Sending message to OpenAI API:", content);
        // Get response from OpenAI API
        const response = await getOpenAIResponse([...messages, userMessage]);
        console.log("Received response from OpenAI API:", response);

        const aiMessage: MessageType = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);

        // Save AI message to Supabase
        if (isSupabaseConfigured()) {
          try {
            await saveChatMessage(aiMessage);
          } catch (err) {
            console.error('Failed to save AI message to Supabase:', err);
            // Continue with local state
          }
        }
      } else {
        // Use fallback response if OpenAI API is not configured
        console.log("OpenAI API is not configured, using fallback response");
        const fallbackResponse = getFallbackResponse(content);

        const aiMessage: MessageType = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: fallbackResponse,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);

        // Save AI message to Supabase
        if (isSupabaseConfigured()) {
          try {
            await saveChatMessage(aiMessage);
          } catch (err) {
            console.error('Failed to save AI message to Supabase:', err);
            // Continue with local state
          }
        }

        // Show toast notification for missing API key
        toast({
          variant: "destructive",
          title: "API Key Missing",
          description: "OpenAI API key is not configured. Please add your API key to the .env file."
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error("Error in useChatAI:", errorMessage);

      // Show toast notification for API errors
      toast({
        variant: "destructive",
        title: "API Connection Error",
        description: `Could not connect to OpenAI API. Error: ${errorMessage}`
      });

      // Use fallback response
      console.log("Using fallback response");
      const fallbackResponse = getFallbackResponse(content);

      const aiMessage: MessageType = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Save AI message to Supabase
      if (isSupabaseConfigured()) {
        try {
          await saveChatMessage(aiMessage);
        } catch (err) {
          console.error('Failed to save AI message to Supabase:', err);
          // Continue with local state
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearMessages = useCallback(async () => {
    // Reset to initial state with system message
    const initialMessages = [
      {
        id: 'system-1',
        role: 'system',
        content: SYSTEM_PROMPT,
        timestamp: new Date()
      }
    ];

    setMessages(initialMessages);
    setError(null);

    // Clear messages from Supabase
    if (isSupabaseConfigured()) {
      try {
        await clearChatMessages();

        // Save system message to Supabase
        await saveChatMessage(initialMessages[0]);
      } catch (err) {
        console.error('Failed to clear chat messages from Supabase:', err);
        // Continue with local state
      }
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages
  };
};
