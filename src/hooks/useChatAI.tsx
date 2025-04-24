
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

// OpenAI API configuration
const API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-3.5-turbo"; // Using GPT-3.5 Turbo as default
const API_KEY = process.env.REACT_APP_OPENAI_API_KEY || ""; // Get API key from environment variable

// No need to check API connection here, we'll do it in the component

export const useChatAI = (): UseChatAIReturn => {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: 'system-1',
      role: 'system',
      content: 'You are R3B3L 4F, an advanced cybersecurity AI assistant. You provide expert guidance on security analysis, ethical hacking, and digital protection. Respond in a technical but accessible manner, with a focus on cybersecurity best practices.',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get real AI response from LM Studio API
  const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
      console.log("Attempting to connect to LM Studio API at:", API_URL);
      console.log("Using model:", MODEL);

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

      // Format the request body exactly as LM Studio expects
      const requestBody = {
        model: MODEL,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: false // Set to false to get a complete response
      };

      console.log("Sending request with body:", JSON.stringify(requestBody));

      // Make API request to OpenAI
      console.log("Making API request to OpenAI:", API_URL);
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error("API Error data:", errorData);
          throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        } catch (jsonError) {
          console.error("Failed to parse error response:", jsonError);
          throw new Error(`API Error: ${response.status} - Could not parse error response`);
        }
      }

      try {
        const data = await response.json();
        console.log("API Response data:", data);
        return data.choices[0].message.content;
      } catch (jsonError) {
        console.error("Failed to parse success response:", jsonError);
        throw new Error("Failed to parse API response");
      }
    } catch (err) {
      console.error("OpenAI API error:", err);
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
      return 'API connection failed. Fallback security analysis activated. Please check your internet connection and OpenAI API key.';
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
      console.log("Sending message to LM Studio API:", content);
      // Try to get a response from the LM Studio API
      const response = await getAIResponse(content);
      console.log("Received response from LM Studio API:", response);

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
        description: `Could not connect to OpenAI API. Please check your internet connection and API key. Error: ${errorMessage}`
      });

      // Use fallback response and mark it as coming from the assistant
      // but still log the error in console
      const fallbackResponse = getFallbackResponse(content);
      console.log("Using fallback response:", fallbackResponse);

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
      content: 'You are R3B3L 4F, an advanced cybersecurity AI assistant. You provide expert guidance on security analysis, ethical hacking, and digital protection. Respond in a technical but accessible manner, with a focus on cybersecurity best practices.',
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
