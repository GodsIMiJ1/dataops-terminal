
import { useState, useCallback } from 'react';

// PlayAI API constants
const PLAYAI_API_KEY = 'ak-8410d8fe5088499abade3c0a5c7561ea';
const USER_ID = 'nMiJHUjQvWNeeuDvnzn5dnRIyBx1';
const API_URL = 'https://api.playht.com/api/v2';

interface UsePlayAIProps {
  onSpeechRecognized?: (text: string) => void;
}

export const usePlayAI = ({ onSpeechRecognized }: UsePlayAIProps = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
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
    startListening,
    stopListening,
    speak,
    isListening,
    isSpeaking,
    error
  };
};

// Add TypeScript types for browser Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  interpretation: any;
  emma: Document | null;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: SpeechGrammarList;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  abort(): void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechGrammarList {
  [index: number]: SpeechGrammar;
  length: number;
  item(index: number): SpeechGrammar;
  addFromURI(src: string, weight: number): void;
  addFromString(string: string, weight: number): void;
}

interface SpeechGrammar {
  src: string;
  weight: number;
}
