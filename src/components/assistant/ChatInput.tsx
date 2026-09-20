import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="z-10 flex shrink-0 gap-2 border-t border-border bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask ChitLedger anything..."
        disabled={disabled}
        className="flex-1 bg-background border border-input rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald focus:border-transparent disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!input.trim() || disabled}
        className="bg-emerald text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-emerald-dark disabled:opacity-50 disabled:hover:bg-emerald transition-colors"
      >
        <Send size={18} />
      </button>
    </form>
  );
}
