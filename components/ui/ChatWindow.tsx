"use client";
import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MessageBubble } from "./MessageBubble";
import { ChatService } from "@/services/api";
import { Message } from "@/types";

export default function ChatWindow({ sessionId }: { sessionId: string }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch past messages
  const { data: serverMessages, isLoading: isFetchingHistory } = useQuery({
    queryKey: ["chatMessages", sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const res = await fetch(`http://localhost:5000/api/chat/${sessionId}`);
      const json = await res.json();

      return json.data.map((m: any) => ({
        id: m.timestamp,
        role: m.role === "user" ? "user" : "model",
        content: m.content,
        timestamp: new Date(m.timestamp),
      }));
    },
    enabled: !!sessionId,
  });

  // Sync
  useEffect(() => {
    if (serverMessages && serverMessages.length > 0) {
      setMessages(serverMessages);
    } else if (sessionId) {
      setMessages([
        {
          id: "welcome",
          role: "model",
          content:
            "Hello! I'm **CoverChat AI**. How can I assist you today?",
          timestamp: new Date(),
        },
      ]);
    }
  }, [serverMessages, sessionId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // Send message
  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      const aiResponse = await ChatService.sendMessage(input, sessionId);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: "err",
          role: "model",
          content:
            "⚠️ Unable to contact server at the moment.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden">

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#fef4e8,_#eef2ff,_#f4e8ff)] opacity-90" />

      {/* Chat container */}
      <div className="relative flex-1 overflow-y-auto pt-10 pb-32 px-4 space-y-6">
        {isFetchingHistory && (
          <div className="w-full flex justify-center mt-10">
            <Loader2 className="animate-spin text-indigo-600" />
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isSending && (
          <div className="w-full flex justify-center text-indigo-500 animate-pulse text-sm">
            <Loader2 className="animate-spin mr-2" size={16} /> Thinking…
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar (floating) */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center px-4">
        <div className="max-w-[700px] w-full bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl rounded-full flex items-center px-4 py-3">
          <input
            type="text"
            value={input}
            disabled={isSending}
            placeholder="Type a message…"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-transparent outline-none text-gray-700"
          />

          <button
            onClick={handleSend}
            disabled={isSending || !input.trim()}
            className="ml-3 h-10 w-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg transition"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
