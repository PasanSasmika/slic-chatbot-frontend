"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Plus, User, Settings, ShieldCheck, Loader2 } from "lucide-react";

interface Props {
  onNewChat: () => void;
  onSelectChat: (sessionId: string) => void;
  isOpen: boolean;
  currentSessionId: string;
}

interface ChatSession {
  session_id: string;
  title: string;
  last_active?: string;
}

export const Sidebar: React.FC<Props> = ({ onNewChat, onSelectChat, isOpen, currentSessionId }) => {
  const { data: sessions = [], isLoading } = useQuery<ChatSession[], Error>({
    queryKey: ["chatHistory"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/chat/history");
      const json = await res.json();
      return json?.data ?? [];
    },
    refetchInterval: 5000,
    enabled: isOpen,
  });

  if (!isOpen) return null;

  return (
    <aside className="
      h-screen w-72 p-5 
      bg-white/40 backdrop-blur-3xl 
      border-r border-white/40 
      shadow-[0_8px_30px_rgb(0,0,0,0.06)]
      flex flex-col
      z-50
    ">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
          <ShieldCheck size={20} />
        </div>
        <span className="text-lg font-semibold text-gray-800">CoverChat</span>
      </div>

      {/* New Chat Button */}
      <button
        onClick={onNewChat}
        className="
          w-full py-3 
          bg-indigo-600 hover:bg-indigo-700 
          text-white rounded-2xl 
          shadow-md shadow-indigo-300/40 
          flex items-center justify-center gap-2 
          transition-all duration-300
        "
      >
        <Plus size={18} /> New Chat
      </button>

      {/* Chat List */}
      <div className="flex-1 mt-5 overflow-y-auto pr-1">
        <p className="text-xs text-gray-500 mb-3">Recent</p>

        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm px-2">
            <Loader2 size={16} className="animate-spin" /> Loading…
          </div>
        )}

        {/* Empty */}
        {!isLoading && sessions.length === 0 && (
          <div className="text-sm text-gray-500 px-2">No chats yet</div>
        )}

        {/* List */}
        {sessions.map((chat) => (
          <button
            key={chat.session_id}
            onClick={() => onSelectChat(chat.session_id)}
            className={`
              w-full text-left px-3 py-3 mb-2 rounded-2xl 
              flex items-center gap-3 
              transition-all duration-200
              backdrop-blur-xl border

              ${
                currentSessionId === chat.session_id
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-lg"
                  : "bg-white/60 hover:bg-white/80 border-white/50 text-gray-700 shadow-sm"
              }
            `}
          >
            <div
              className={`
                h-8 w-8 rounded-xl flex items-center justify-center shadow-sm
                ${
                  currentSessionId === chat.session_id
                    ? "bg-white/20"
                    : "bg-white/80"
                }
              `}
            >
              <MessageSquare
                size={17}
                className={currentSessionId === chat.session_id ? "text-white" : "text-gray-600"}
              />
            </div>

            <span className="truncate">{chat.title}</span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-white/40">
        <button className="flex items-center w-full gap-3 px-2 py-3 rounded-xl hover:bg-white/60 transition">
          <div className="h-9 w-9 bg-indigo-600 text-white flex items-center justify-center rounded-xl shadow-md">
            <User size={16} />
          </div>

          <div className="flex flex-col">
            <span className="font-medium text-gray-900">Kasun Perera</span>
            <span className="text-xs text-gray-500">Online</span>
          </div>

          <Settings size={16} className="ml-auto text-gray-400" />
        </button>
      </div>
    </aside>
  );
};
