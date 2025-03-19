
import { useState, useCallback } from 'react';

// PlayAI API constants
const PLAYAI_API_KEY = 'ak-8410d8fe5088499abade3c0a5c7561ea';
const USER_ID = 'nMiJHUjQvWNeeuDvnzn5dnRIyBx1';
const API_URL = 'https://api.playht.com/api/v2';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to convert text to speech
  const speak = useCallback(async (text: string) => {
    if (!text) return;
    
    try {
      setIsSpeaking(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PLAYAI_API_KEY}`,
          'X-User-ID': USER_ID
        },
        body: JSON.stringify({
          text,
          voice: 'en-US-GuyNeural', // Default voice, can be customized
          speed: 1.0,
          preset: 'balanced'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate speech');
      }
      
      const data = await response.json();
      
      // Play the audio
      if (data.url) {
        const audio = new Audio(data.url);
        audio.onended = () => {
          setIsSpeaking(false);
        };
        audio.onerror = () => {
          setError('Error playing audio');
          setIsSpeaking(false);
        };
        audio.play();
      } else {
        throw new Error('No audio URL returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setIsSpeaking(false);
    }
  }, []);

  return {
    speak,
    isSpeaking,
    error
  };
};
