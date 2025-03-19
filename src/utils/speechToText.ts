
import { useState, useCallback } from 'react';
import { SpeechRecognition } from '../types/speechRecognition.types';

type ErrorSetter = (error: string | null) => void;
type ListeningSetter = (isListening: boolean) => void;

export const useSpeechToText = (
  onSpeechRecognized?: (text: string) => void
) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to convert speech to text
  const startListening = useCallback(async () => {
    try {
      setIsListening(true);
      setError(null);
      
      // Check if browser supports Speech Recognition
      // Use window.SpeechRecognition for TypeScript
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognitionAPI) {
        throw new Error("Your browser doesn't support speech recognition");
      }
      
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onSpeechRecognized) {
          onSpeechRecognized(transcript);
        }
      };
      
      recognition.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setIsListening(false);
    }
  }, [onSpeechRecognized]);
  
  const stopListening = useCallback(() => {
    setIsListening(false);
    // Stop the speech recognition if it's active
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionAPI();
      recognition.stop();
    }
  }, []);

  return {
    startListening,
    stopListening,
    isListening,
    error
  };
};
