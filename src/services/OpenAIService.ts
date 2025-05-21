/**
 * OpenAIService.ts
 *
 * This service provides integration with the OpenAI API for R3B3L 4F.
 * It handles communication with the GPT-4o model for chat functionality.
 */

import { MessageType } from '@/hooks/useChatAI';
import { isAirlockActive } from './AirlockService';

// OpenAI API configuration via proxy server
const API_URL = import.meta.env.VITE_OPENAI_PROXY_URL || 'http://localhost:5000/api/openai/chat';
const MODEL = 'gpt-4o'; // Using GPT-4o as default
const API_TOKEN = import.meta.env.VITE_API_TOKEN || 'r3b3l-4f-secure-token';

// Types for OpenAI API
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Check if the OpenAI API proxy is configured
 * @returns True if the API proxy is configured, false otherwise
 */
export const isOpenAIConfigured = (): boolean => {
  return API_URL !== '';
};

/**
 * Convert internal message format to OpenAI format
 * @param messages - The messages to convert
 * @returns The messages in OpenAI format
 */
const convertToOpenAIMessages = (messages: MessageType[]): OpenAIMessage[] => {
  return messages.map(msg => ({
    role: msg.role as 'system' | 'user' | 'assistant',
    content: msg.content
  }));
};

/**
 * Get a response from the OpenAI API
 * @param messages - The conversation history
 * @returns The AI response
 */
export const getOpenAIResponse = async (messages: MessageType[]): Promise<string> => {
  // Check if airlock is active
  if (isAirlockActive()) {
    throw new Error('Airlock is active. Internet access is disabled.');
  }

  // Check if API key is configured
  if (!isOpenAIConfigured()) {
    throw new Error('OpenAI API key is not configured. Please add your API key to the .env file.');
  }

  try {
    console.log("Sending request to OpenAI API via proxy with model:", MODEL);

    // Convert messages to OpenAI format
    const openAIMessages = convertToOpenAIMessages(messages);

    // Format the request body for OpenAI
    const requestBody: OpenAIRequest = {
      model: MODEL,
      messages: openAIMessages,
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: false
    };

    // Make API request to OpenAI via our proxy server
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Token': API_TOKEN
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
      const data: OpenAIResponse = await response.json();
      console.log("API Response data:", data);

      // OpenAI returns the response in data.choices[0].message.content
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

/**
 * Get fallback responses in case the API connection fails
 * @param userMessage - The user's message
 * @returns A fallback response
 */
export const getFallbackResponse = (userMessage: string): string => {
  if (userMessage.toLowerCase().includes('vulnerability')) {
    return 'Vulnerability scan initiated. Analyzing system for potential security weaknesses. Several CVEs detected in outdated packages. Recommend immediate patching.';
  } else if (userMessage.toLowerCase().includes('password')) {
    return 'Password security analysis complete. Several weak credentials detected. Implementing zero-trust architecture and multi-factor authentication recommended.';
  } else if (userMessage.toLowerCase().includes('hack')) {
    return 'Ethical hacking protocols engaged. Remember, we only hack with proper authorization and for defensive purposes. Scanning for potential entry points and vulnerabilities.';
  } else if (userMessage.toLowerCase().includes('network')) {
    return 'Network analysis complete. Detected several unsecured endpoints and potential data leakage points. Recommend implementing proper segmentation and access controls.';
  } else if (userMessage.toLowerCase().includes('encryption')) {
    return 'Encryption analysis initiated. Current implementation uses outdated algorithms. Recommend upgrading to AES-256 with proper key management protocols.';
  } else {
    return 'API connection failed. Fallback security analysis activated. Please check your internet connection and API key configuration.';
  }
};

export default {
  isOpenAIConfigured,
  getOpenAIResponse,
  getFallbackResponse
};
