
import { useState } from 'react';
import { useSpeechToText } from '../utils/speechToText';
import { useTextToSpeech } from '../utils/textToSpeech';

interface UsePlayAIProps {
  onSpeechRecognized?: (text: string) => void;
}

export const usePlayAI = ({ onSpeechRecognized }: UsePlayAIProps = {}) => {
  const {
    startListening,
    stopListening,
    isListening,
    error: speechToTextError
  } = useSpeechToText(onSpeechRecognized);

  const {
    speak,
    isSpeaking,
    error: textToSpeechError
  } = useTextToSpeech();

  // Combine errors from both utilities
  const error = speechToTextError || textToSpeechError;

  return {
    startListening,
    stopListening,
    speak,
    isListening,
    isSpeaking,
    error
  };
};
