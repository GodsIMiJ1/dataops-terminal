/**
 * SupabaseService.ts
 * 
 * This service provides integration with Supabase for R3B3L 4F.
 * It handles device ID generation, chat message persistence, and session management.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { MessageType } from '@/hooks/useChatAI';

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Device ID storage key
const DEVICE_ID_KEY = 'r3b3l_4f_device_id';

// Supabase client
let supabaseClient: SupabaseClient | null = null;

// Types for Supabase tables
interface DeviceSession {
  device_id: string;
  created_at: string;
}

interface ChatLog {
  id?: string;
  device_id: string;
  role: string;
  content: string;
  timestamp: string;
}

/**
 * Initialize the Supabase client
 * @returns The Supabase client
 */
export const initSupabase = (): SupabaseClient => {
  if (!supabaseClient && SUPABASE_URL && SUPABASE_KEY) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase client initialized');
  } else if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Supabase URL or key is not configured');
  }

  return supabaseClient as SupabaseClient;
};

/**
 * Check if Supabase is configured
 * @returns True if Supabase is configured, false otherwise
 */
export const isSupabaseConfigured = (): boolean => {
  return SUPABASE_URL !== '' && SUPABASE_KEY !== '';
};

/**
 * Get or generate a device ID
 * @returns The device ID
 */
export const getOrGenerateDeviceId = (): string => {
  try {
    // Try to get the device ID from localStorage
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);

    // If no device ID exists, generate a new one
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
      console.log('Generated new device ID:', deviceId);
    } else {
      console.log('Using existing device ID:', deviceId);
    }

    return deviceId;
  } catch (error) {
    // If localStorage is not available, generate a temporary device ID
    console.error('Failed to access localStorage:', error);
    return uuidv4();
  }
};

/**
 * Register a device session in Supabase
 * @param deviceId - The device ID to register
 * @returns True if successful, false otherwise
 */
export const registerDeviceSession = async (deviceId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    console.error('Supabase is not configured');
    return false;
  }

  try {
    const supabase = initSupabase();
    
    // Check if the device session already exists
    const { data: existingSession } = await supabase
      .from('device_sessions')
      .select('device_id')
      .eq('device_id', deviceId)
      .single();

    if (!existingSession) {
      // Insert a new device session
      const { error } = await supabase
        .from('device_sessions')
        .insert({ device_id: deviceId });

      if (error) {
        console.error('Failed to register device session:', error);
        return false;
      }

      console.log('Device session registered successfully');
    } else {
      console.log('Device session already exists');
    }

    return true;
  } catch (error) {
    console.error('Failed to register device session:', error);
    return false;
  }
};

/**
 * Save a chat message to Supabase
 * @param message - The message to save
 * @returns True if successful, false otherwise
 */
export const saveChatMessage = async (message: MessageType): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    console.error('Supabase is not configured');
    return false;
  }

  try {
    const supabase = initSupabase();
    const deviceId = getOrGenerateDeviceId();

    // Ensure the device session exists
    await registerDeviceSession(deviceId);

    // Insert the chat message
    const { error } = await supabase
      .from('chat_logs')
      .insert({
        device_id: deviceId,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp.toISOString()
      });

    if (error) {
      console.error('Failed to save chat message:', error);
      return false;
    }

    console.log('Chat message saved successfully');
    return true;
  } catch (error) {
    console.error('Failed to save chat message:', error);
    return false;
  }
};

/**
 * Load chat messages from Supabase
 * @returns The chat messages
 */
export const loadChatMessages = async (): Promise<MessageType[]> => {
  if (!isSupabaseConfigured()) {
    console.error('Supabase is not configured');
    return [];
  }

  try {
    const supabase = initSupabase();
    const deviceId = getOrGenerateDeviceId();

    // Fetch chat messages for the device
    const { data, error } = await supabase
      .from('chat_logs')
      .select('*')
      .eq('device_id', deviceId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Failed to load chat messages:', error);
      return [];
    }

    // Convert to MessageType format
    const messages: MessageType[] = data.map(log => ({
      id: log.id || `message-${Date.now()}-${Math.random()}`,
      role: log.role as 'user' | 'assistant' | 'system' | 'error',
      content: log.content,
      timestamp: new Date(log.timestamp)
    }));

    console.log(`Loaded ${messages.length} chat messages`);
    return messages;
  } catch (error) {
    console.error('Failed to load chat messages:', error);
    return [];
  }
};

/**
 * Clear chat messages from Supabase
 * @returns True if successful, false otherwise
 */
export const clearChatMessages = async (): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    console.error('Supabase is not configured');
    return false;
  }

  try {
    const supabase = initSupabase();
    const deviceId = getOrGenerateDeviceId();

    // Delete chat messages for the device
    const { error } = await supabase
      .from('chat_logs')
      .delete()
      .eq('device_id', deviceId);

    if (error) {
      console.error('Failed to clear chat messages:', error);
      return false;
    }

    console.log('Chat messages cleared successfully');
    return true;
  } catch (error) {
    console.error('Failed to clear chat messages:', error);
    return false;
  }
};

export default {
  initSupabase,
  isSupabaseConfigured,
  getOrGenerateDeviceId,
  registerDeviceSession,
  saveChatMessage,
  loadChatMessages,
  clearChatMessages
};
