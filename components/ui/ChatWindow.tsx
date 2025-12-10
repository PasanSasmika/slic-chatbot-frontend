"use client";
import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Menu, PanelLeftOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ChatService } from "@/services/api";
import { Message } from "@/types";
import { MessageBubble } from "./MessageBubble";

interface Props {
  sessionId: string;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function ChatWindow({ sessionId, toggleSidebar, isSidebarOpen }: Props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch History (Fixed Duplicate Key Error)
  const { data: serverMessages, isLoading: isFetchingHistory } = useQuery({
    queryKey: ["chatMessages", sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const res = await fetch(`http://localhost:5000/api/chat/${sessionId}`);
      const json = await res.json();
      
      // FIX: Added index to make ID unique
      return json.data.map((m: any, index: number) => ({
        id: `${m.timestamp}-${index}`, 
        role: m.role === "user" ? "user" : "model",
        content: m.content,
        timestamp: new Date(m.timestamp),
      }));
    },
    enabled: !!sessionId,
  });

  // 2. Sync State
  useEffect(() => {
    if (serverMessages && serverMessages.length > 0) {
      setMessages(serverMessages);
    } else if (sessionId) {
      setMessages([{
        id: "welcome",
        role: "model",
        content: "Hello! I'm **CoverChat AI**. I can assist with vehicle quotes, claims, and policies.",
        timestamp: new Date(),
      }]);
    }
  }, [serverMessages, sessionId]);

  // 3. Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // 4. Send Logic
  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    
    // Create unique ID for local optimistic update
    const userMsg: Message = { 
        id: `local-${Date.now()}`, 
        role: "user", 
        content: input, 
        timestamp: new Date() 
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      const aiResponse = await ChatService.sendMessage(userMsg.content, sessionId);
      const aiMsg: Message = { 
          id: `ai-${Date.now()}`, // Unique ID
          role: "model", 
          content: aiResponse, 
          timestamp: new Date() 
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [...prev, { id: `err-${Date.now()}`, role: "model", content: "⚠️ **Network Error**", timestamp: new Date() }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-[#f8fafc]">
      
      {/* Background Ambience */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#0dafbc]/10 rounded-full blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#dfc550]/10 rounded-full blur-[120px] opacity-60 pointer-events-none" />

      {/* HEADER BAR */}
      <div className="absolute top-0 left-0 right-0 z-30 px-6 py-4 flex items-center justify-between pointer-events-none">
        
        {/* TOGGLE BUTTON (Pointer events auto) */}
        <button 
          onClick={toggleSidebar} 
          className={`
            pointer-events-auto p-2.5 rounded-xl shadow-sm border border-slate-200 transition-all duration-300
            ${isSidebarOpen 
               ? 'bg-white/50 text-slate-400 md:opacity-0 md:pointer-events-none' // Hidden on Desktop if Open
               : 'bg-white text-slate-700 hover:text-[#0dafbc] shadow-md opacity-100' // Always Visible if Closed
            }
          `}
          title={isSidebarOpen ? "Close Menu" : "Open Menu"}
        >
          {isSidebarOpen ? <Menu size={20} /> : <PanelLeftOpen size={20} />}
        </button>

        {/* Mobile Title */}
        <span className="md:hidden font-bold text-slate-700 bg-white/40 px-3 py-1 rounded-full backdrop-blur-md text-sm pointer-events-auto">
          CoverChat AI
        </span>
        <div className="w-10 md:hidden" />
      </div>

      {/* Chat Area */}
      <div className="relative z-10 flex-1 overflow-y-auto pt-20 pb-32 px-4 md:px-10 scroll-smooth custom-scrollbar">
        {isFetchingHistory && (
          <div className="flex justify-center my-4">
            <Loader2 className="animate-spin text-[#0dafbc]" />
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-2">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isSending && (
            <div className="flex items-center gap-3 ml-4 mt-4 animate-pulse">
               <div className="h-2 w-2 bg-[#0dafbc] rounded-full animate-bounce" />
               <div className="h-2 w-2 bg-[#0dafbc] rounded-full animate-bounce delay-100" />
               <div className="h-2 w-2 bg-[#0dafbc] rounded-full animate-bounce delay-200" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating Input */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center px-4">
        <div className="w-full max-w-3xl bg-white/70 backdrop-blur-2xl border border-white/50 shadow-[0_20px_40px_rgba(0,0,0,0.1)] rounded-3xl p-2 flex items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-[#0dafbc]/30 focus-within:scale-[1.01]">
          <input
            type="text"
            value={input}
            disabled={isSending}
            placeholder="Ask CoverChat AI anything..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-slate-700 placeholder-slate-400 font-medium"
          />
          <button
            onClick={handleSend}
            disabled={isSending || !input.trim()}
            className="p-3.5 bg-gradient-to-tr from-[#0dafbc] to-[#0bcad8] hover:shadow-lg hover:shadow-[#0dafbc]/40 text-white rounded-2xl transition-all disabled:opacity-50 disabled:shadow-none transform active:scale-95"
          >
            {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}