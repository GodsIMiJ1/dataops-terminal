
import { useState, useCallback } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  timestamp: Date;
}

interface UseChatAIReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

// This is a simulated AI chat hook
// In a real implementation, this would connect to Ollama with the deepseekr1-14b model
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

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getAIResponse(content);
      
      const aiMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
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
    } finally {
      setIsLoading(false);
    }
  }, []);

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
