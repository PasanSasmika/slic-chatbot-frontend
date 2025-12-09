"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { MessageBubble } from './MessageBubble';
import { ChatService } from '@/services/api';
import { Message } from '@/types';

interface Props {
  sessionId: string;
}

export default function ChatWindow({ sessionId }: Props) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Old Messages from Backend when sessionId changes
  const { data: serverMessages, isLoading: isFetchingHistory } = useQuery({
    queryKey: ['chatMessages', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const res = await fetch(`http://localhost:5000/api/chat/${sessionId}`);
      const json = await res.json();
      
      // Map Backend Format to Frontend 'Message' Type
      return json.data.map((m: any) => ({
        id: m.timestamp, // Using timestamp as ID for simplicity
        role: m.role === 'user' ? 'user' : 'model', 
        content: m.content,
        timestamp: new Date(m.timestamp)
      }));
    },
    enabled: !!sessionId // Only fetch if we have a valid session ID
  });

  // 2. Sync Server Messages to Local State
  useEffect(() => {
    if (serverMessages && serverMessages.length > 0) {
      setMessages(serverMessages);
    } else if (sessionId) {
      // If it's a new empty session, show the Welcome Message
      setMessages([{
        id: 'welcome',
        role: 'model',
        content: 'Hello! I am **CoverChat AI**. I can help you with vehicle quotes, policy renewals, and claim status. How can I assist you today?',
        timestamp: new Date()
      }]);
    }
  }, [serverMessages, sessionId]);

  // 3. Auto-scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // 4. Handle Sending a New Message
  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    // Create User Message Object
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    // Optimistic Update: Show message immediately
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      // Call Backend API
      const aiResponseText = await ChatService.sendMessage(userMsg.content, sessionId);

      // Create AI Response Object
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: aiResponseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        id: 'error',
        role: 'model',
        content: '⚠️ **Connection Error**: I could not reach the server. Please ensure the backend is running.',
        timestamp: new Date()
      }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {/* 1. Mobile Header (Spacer for Sidebar Toggle) */}
      <div className="bg-white border-b px-6 py-3 shadow-sm flex items-center justify-between md:hidden shrink-0">
         <div className="w-8"></div> 
         <h1 className="text-sm font-bold text-gray-700">CoverChat AI</h1>
         <div className="w-8"></div>
      </div>

      {/* 2. Messages List Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
        {/* Loading Spinner for History Fetch */}
        {isFetchingHistory && (
          <div className="flex justify-center p-4">
            <Loader2 className="animate-spin text-blue-500" />
          </div>
        )}

        {/* Message Bubbles */}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Loading Spinner for New Message Generation */}
        {isSending && (
          <div className="flex items-center gap-2 text-gray-500 text-sm ml-4 animate-pulse">
            <Loader2 className="animate-spin" size={16} /> Thinking...
          </div>
        )}
        
        {/* Invisible div to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input Area */}
      <div className="bg-white border-t p-4 md:p-6 z-20 shrink-0">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 disabled:bg-gray-100"
            placeholder="Type your question here (e.g., 'Quote for a 5M car')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isSending}
          />
          <button
            onClick={handleSend}
            disabled={isSending || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-3 rounded-xl transition-colors shadow-sm flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          AI can make mistakes. Please verify important information with SLIC.
        </p>
      </div>
    </div>
  );
}