import React from 'react';
import { MessageSquarePlus } from 'lucide-react';

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

const prompts = [
  "Who hasn't paid?",
  "Show pending payments",
  "When is the next auction?",
  "Who needs attention?",
  "Show Rahul Sharma's payment history",
  "My payment history"
];

export function SuggestedPrompts({ onSelectPrompt }: SuggestedPromptsProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 space-y-6 text-center max-w-2xl mx-auto mt-12">
      <div className="w-16 h-16 bg-emerald/10 text-emerald-dark rounded-full flex items-center justify-center mb-2">
        <MessageSquarePlus size={32} />
      </div>
      <h2 className="text-2xl font-bold text-navy">Welcome to ChitLedger Assistant</h2>
      <p className="text-muted">Ask questions about your group's members, payments, auctions, ledger, and risk information to get instant insights.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-6">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(prompt)}
            className="px-4 py-3 text-sm text-left bg-card border border-border rounded-xl hover:border-emerald hover:shadow-sm hover:text-emerald-dark transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
