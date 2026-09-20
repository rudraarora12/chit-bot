import React from 'react';

export function TypingIndicator() {
  return (
    <div className="flex w-full mt-4 space-x-3 max-w-3xl mx-auto px-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald flex items-center justify-center text-white">
        {/* Simple bot icon or initial */}
        <span className="text-xs font-bold">CL</span>
      </div>
      <div className="bg-card border border-border p-3 rounded-2xl rounded-tl-sm flex items-center space-x-1 w-16">
        <div className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}
