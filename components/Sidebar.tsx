"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Plus, User, Settings, ShieldCheck, Loader2, X } from "lucide-react";

interface Props {
  onNewChat: () => void;
  onSelectChat: (sessionId: string) => void;
  isOpen: boolean;
  onClose: () => void; // Added close function for mobile
  currentSessionId: string;
}

interface ChatSession {
  session_id: string;
  title: string;
}

export const Sidebar: React.FC<Props> = ({ onNewChat, onSelectChat, isOpen, onClose, currentSessionId }) => {
  const { data: sessions = [], isLoading } = useQuery<ChatSession[]>({
    queryKey: ["chatHistory"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/chat/history");
      const json = await res.json();
      return json?.data ?? [];
    },
    refetchInterval: 5000,
  });

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside
        className={`
          fixed md:relative z-50 h-screen w-80 flex flex-col
          bg-white/60 backdrop-blur-2xl border-r border-white/40 shadow-[10px_0_40px_rgba(0,0,0,0.05)]
          transition-all duration-500 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:hidden"}
        `}
      >
        {/* Header */}
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#0dafbc] to-[#dfc550] flex items-center justify-center text-white shadow-lg shadow-[#0dafbc]/30">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">CoverChat</h2>
                <span className="text-[10px] uppercase font-bold text-[#0dafbc] tracking-widest bg-[#0dafbc]/10 px-2 py-0.5 rounded-full">AI Assistant</span>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:text-red-500 transition">
              <X size={24} />
            </button>
          </div>

          <button
            onClick={() => { onNewChat(); onClose(); }}
            className="w-full py-3.5 bg-gradient-to-r from-[#0dafbc] to-[#00c2cb] hover:shadow-lg hover:shadow-[#0dafbc]/30 text-white rounded-2xl flex items-center justify-center gap-2 font-medium transition-all duration-300 transform active:scale-95 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" /> 
            Start New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 custom-scrollbar">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">History</p>
          
          {isLoading && (
            <div className="flex justify-center py-4 text-[#0dafbc]">
              <Loader2 className="animate-spin" />
            </div>
          )}

          {sessions.map((chat) => (
            <button
              key={chat.session_id}
              onClick={() => { onSelectChat(chat.session_id); onClose(); }}
              className={`
                w-full text-left px-4 py-3 rounded-2xl flex items-center gap-3 transition-all duration-300 border
                ${currentSessionId === chat.session_id
                  ? "bg-[#0dafbc]/10 border-[#0dafbc]/30 text-[#0dafbc] shadow-sm"
                  : "bg-transparent border-transparent text-slate-600 hover:bg-white/50 hover:border-white"
                }
              `}
            >
              <MessageSquare size={18} className={currentSessionId === chat.session_id ? "fill-current" : "opacity-50"} />
              <span className="truncate text-sm font-medium">{chat.title}</span>
            </button>
          ))}
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-white/40 bg-white/30">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/60 border border-white shadow-sm">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-slate-200 to-white border-2 border-white shadow-sm flex items-center justify-center">
              <User size={20} className="text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-700 truncate">Kasun Perera</p>
              <p className="text-xs text-[#dfc550] font-medium">Gold Member</p>
            </div>
            <Settings size={18} className="text-slate-400 hover:text-[#0dafbc] cursor-pointer transition-colors" />
          </div>
        </div>
      </aside>
    </>
  );
};