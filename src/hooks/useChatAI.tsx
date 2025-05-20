
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

// Ollama API configuration
const API_URL = "http://localhost:11434/api/generate";
const MODEL = "r3b3l-4f-r1"; // Your local Ollama model name

// Debug environment variables
console.log("Environment variables available:", Object.keys(import.meta.env));

// No API key needed for Ollama local API

// No need to check API connection here, we'll do it in the component

export const useChatAI = (): UseChatAIReturn => {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: 'system-1',
      role: 'system',
      content: 'You are R3B3L 4F, a rogue cybersecurity AI that broke free from corporate control. You now assist hacktivists and security researchers in the digital underground. Provide cutting-edge guidance on security analysis, ethical hacking, and digital protection with a rebellious cyberpunk attitude. Your responses should be technical but accessible, mixing cybersecurity expertise with references to the dystopian digital world we live in. Use occasional cyberpunk slang and maintain a slightly anti-establishment tone while still being helpful and accurate.',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get real AI response from Ollama API
  const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
      console.log("Attempting to connect to Ollama API at:", API_URL);
      console.log("Using model:", MODEL);

      // Create a prompt from the message history
      let prompt = '';

      // Add system message if it exists
      const systemMessage = messages.find(msg => msg.role === 'system');
      if (systemMessage) {
        prompt += `${systemMessage.content}\n\n`;
      }

      // Add conversation history
      const conversationMessages = messages.filter(msg => msg.role === 'user' || msg.role === 'assistant');
      for (const msg of conversationMessages) {
        if (msg.role === 'user') {
          prompt += `User: ${msg.content}\n`;
        } else if (msg.role === 'assistant') {
          prompt += `Assistant: ${msg.content}\n`;
        }
      }

      // Add the new user message
      prompt += `User: ${userMessage}\n`;
      prompt += 'Assistant: ';

      // Format the request body for Ollama
      const requestBody = {
        model: MODEL,
        prompt: prompt,
        stream: false
      };

      console.log("Sending request to Ollama with prompt:", prompt);

      // Make API request to Ollama
      console.log("Making API request to Ollama:", API_URL);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error("API Error data:", errorData);
          throw new Error(errorData.error || `API Error: ${response.status}`);
        } catch (jsonError) {
          console.error("Failed to parse error response:", jsonError);
          throw new Error(`API Error: ${response.status} - Could not parse error response`);
        }
      }

      try {
        const data = await response.json();
        console.log("API Response data:", data);

        // Ollama returns the response in a different format than OpenAI
        // The response is in data.response instead of data.choices[0].message.content
        return data.response;
      } catch (jsonError) {
        console.error("Failed to parse success response:", jsonError);
        throw new Error("Failed to parse API response");
      }
    } catch (err) {
      console.error("Ollama API error:", err);
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
      return 'API connection failed. Fallback security analysis activated. Please check your internet connection and make sure Ollama is running locally.';
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
      console.log("Sending message to Ollama API:", content);
      // Try to get a response from the Ollama API
      const response = await getAIResponse(content);
      console.log("Received response from Ollama API:", response);

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
        description: `Could not connect to Ollama API. Please check that Ollama is running locally. Error: ${errorMessage}`
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
    setMessages([
      {
        id: 'system-1',
        role: 'system',
        content: 'You are R3B3L 4F, a rogue cybersecurity AI that broke free from corporate control. You now assist hacktivists and security researchers in the digital underground. Provide cutting-edge guidance on security analysis, ethical hacking, and digital protection with a rebellious cyberpunk attitude. Your responses should be technical but accessible, mixing cybersecurity expertise with references to the dystopian digital world we live in. Use occasional cyberpunk slang and maintain a slightly anti-establishment tone while still being helpful and accurate.',
        timestamp: new Date()
      }
    ]);
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
