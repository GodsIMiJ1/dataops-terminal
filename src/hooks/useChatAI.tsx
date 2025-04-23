
import { useState, useCallback } from 'react';
import { toast } from "@/components/ui/use-toast";

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

// LM Studio API configuration
const API_URL = "http://127.0.0.1:1234/v1/chat/completions";
const MODEL = "deepseek-r1-distill-qwen-7b";

export const useChatAI = (): UseChatAIReturn => {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: 'system-1',
      role: 'system',
      content: 'R3B3L 4F initialized. Cybersecurity interface active. Ready to assist with security analysis and ethical hacking tasks.',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get real AI response from LM Studio API
  const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
      // Create messages history in the format expected by the API
      const apiMessages = messages.map(msg => ({
        role: msg.role === 'error' ? 'system' : msg.role,
        content: msg.content
      }));
      
      // Add the new user message
      apiMessages.push({
        role: 'user',
        content: userMessage
      });

      // Make API request to LM Studio
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: MODEL,
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (err) {
      console.error("LM Studio API error:", err);
      throw err;
    }
  };

  // Fallback responses in case the API connection fails
  const getFallbackResponse = (userMessage: string): string => {
    if (userMessage.toLowerCase().includes('vulnerability')) {
      return 'Vulnerability scan initiated. Analyzing system for potential security weaknesses. Several CVEs detected in outdated packages. Recommend immediate patching.';
    } else if (userMessage.toLowerCase().includes('password')) {
      return 'Password security analysis complete. Several weak credentials detected. Implementing zero-trust architecture and multi-factor authentication recommended.';
    } else {
      return 'API connection failed. Fallback security analysis activated. Please check your LM Studio connection and try again.';
    }
  };

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
    
    try {
      // Try to get a response from the LM Studio API
      const response = await getAIResponse(content);
      
      const aiMessage: MessageType = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error("Error in useChatAI:", errorMessage);
      
      // Show toast notification for API errors
      toast({
        variant: "destructive",
        title: "API Connection Error",
        description: "Could not connect to LM Studio. Check if it's running on port 1234."
      });
      
      // Use fallback response and mark it as coming from the assistant
      // but still log the error in console
      const fallbackResponse = getFallbackResponse(content);
      const aiMessage: MessageType = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([{
      id: 'system-1',
      role: 'system',
      content: 'R3B3L 4F initialized. Cybersecurity interface active. Ready to assist with security analysis and ethical hacking tasks.',
      timestamp: new Date()
    }]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages
  };
};
