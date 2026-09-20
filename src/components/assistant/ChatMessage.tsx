import React from 'react';
import { Link } from 'react-router-dom';
import type { Message } from '@/data/assistantMockData';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  // Basic formatting for **bold** and newlines
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.trim() === '') return <br key={i} />;
      
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className={isUser ? 'text-white' : 'text-foreground'}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className={`flex w-full mt-4 space-x-3 max-w-3xl mx-auto px-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald flex items-center justify-center text-white mt-auto mb-auto">
          <span className="text-xs font-bold">CL</span>
        </div>
      )}
      
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
        <div 
          className={`px-4 py-3 rounded-2xl ${
            isUser 
              ? 'bg-navy text-white rounded-br-sm' 
              : 'bg-card border border-border rounded-tl-sm text-foreground shadow-sm'
          }`}
        >
          <div className="text-sm space-y-1">
            {formatText(message.content)}
          </div>
          
          {message.actions && message.actions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.actions.map((action, i) => (
                <Link
                  key={i}
                  to={action.href}
                  className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium bg-emerald/10 text-emerald-dark rounded-md hover:bg-emerald hover:text-white transition-colors"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          )}
        </div>
        <span className="text-[10px] text-muted mt-1 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white mt-auto mb-auto">
          <span className="text-xs font-bold">U</span>
        </div>
      )}
    </div>
  );
}
