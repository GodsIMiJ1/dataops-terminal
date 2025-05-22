
import React, { useState } from 'react';
import { Send, RotateCcw } from 'lucide-react';
import ActionButton from '../ActionButton';
import VoiceChat from '../VoiceChat';

interface ChatInputAreaProps {
  onSendMessage: (text: string) => void;
  onClearMessages: () => void;
  isLoading: boolean;
}

const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  onSendMessage,
  onClearMessages,
  isLoading
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  // Handle voice recognition results
  const handleSpeechRecognized = (text: string) => {
    setInput(text);
    // Auto-submit after voice recognition
    if (text.trim()) {
      onSendMessage(text);
      setInput('');
    }
  };

  return (
    <div className="p-4 border-t border-pro-border dark:border-pro-border-dark bg-white dark:bg-pro-bg-darkPanel">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question or enter a command..."
            className="w-full bg-white dark:bg-gray-800 border border-pro-border dark:border-pro-border-dark focus:border-pro-primary focus:ring-1 focus:ring-pro-primary/50 rounded p-2 text-sm"
            disabled={isLoading}
          />
          {input && (
            <button
              type="button"
              onClick={() => setInput('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-pro-text-muted hover:text-pro-primary dark:text-pro-text-mutedDark dark:hover:text-pro-primary-light"
            >
              ×
            </button>
          )}
        </div>

        <VoiceChat
          onSpeechRecognized={handleSpeechRecognized}
          disabled={isLoading}
        />

        <ActionButton
          type="submit"
          disabled={isLoading || !input.trim()}
          icon={<Send className="w-4 h-4" />}
        >
          Send
        </ActionButton>

        <ActionButton
          type="button"
          variant="danger"
          onClick={onClearMessages}
          icon={<RotateCcw className="w-4 h-4" />}
        >
          Clear
        </ActionButton>
      </form>
    </div>
  );
};

export default ChatInputArea;
