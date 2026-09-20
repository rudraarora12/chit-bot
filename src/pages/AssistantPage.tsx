import React, { useState, useRef, useEffect } from 'react';
import { Show, RedirectToSignIn } from '@clerk/react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { mockDashboardData } from '@/data/dashboard';
import { ChatInput } from '@/components/assistant/ChatInput';
import { SuggestedPrompts } from '@/components/assistant/SuggestedPrompts';
import { ChatMessage } from '@/components/assistant/ChatMessage';
import { TypingIndicator } from '@/components/assistant/TypingIndicator';
import { assistantService } from '@/data/assistantMockData';
import type { Message } from '@/data/assistantMockData';
import { Bot } from 'lucide-react';

export default function AssistantPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  
  const data = mockDashboardData;

  useEffect(() => {
    const container = chatScrollRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Get bot response
      const botMessage = await assistantService.processQuery(content);
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Failed to get assistant response:", error);
      // Fallback error message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <Show when="signed-in">
        <div className="flex h-dvh max-h-dvh overflow-hidden bg-background text-foreground antialiased">
          {/* Sidebar Navigation */}
          <Sidebar
            mobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />

          {/* Main Layout Area */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {/* Top Bar Header */}
            <div className="shrink-0">
              <TopBar
                groupName={data.groupName}
                currentCycle={data.currentCycle}
                totalCycles={data.totalCycles}
                onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
              />
            </div>

            {/* Assistant Content Workspace */}
            <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#f8fafc]">
              
              {/* Header */}
              <div className="bg-card border-b border-border py-4 px-6 flex items-center justify-between shadow-sm z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald/10 text-emerald-dark rounded-xl flex items-center justify-center">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-navy leading-none">
                      ChitLedger AI Assistant
                    </h2>
                    <p className="mt-1 text-xs text-muted font-medium">
                      Ask questions about your group, payments, auctions and members.
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Area */}
              <div ref={chatScrollRef} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-6 pt-4">
                {messages.length === 0 ? (
                  <SuggestedPrompts onSelectPrompt={handleSendMessage} />
                ) : (
                  <div className="flex flex-col pb-8">
                    {messages.map((msg) => (
                      <ChatMessage key={msg.id} message={msg} />
                    ))}
                    {isTyping && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input Area */}
              <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
            </main>
          </div>
        </div>
      </Show>

      <Show when="signed-out">
        <RedirectToSignIn />
      </Show>
    </>
  );
}
