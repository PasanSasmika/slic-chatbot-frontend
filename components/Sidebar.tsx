"use client";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Plus, User, Settings, ShieldCheck, Loader2, X, Trash2, PanelLeftClose } from "lucide-react";

interface Props {
  onNewChat: () => void;
  onSelectChat: (sessionId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  currentSessionId: string;
}

interface ChatSession {
  session_id: string;
  title: string;
}

export const Sidebar: React.FC<Props> = ({ onNewChat, onSelectChat, isOpen, onClose, currentSessionId }) => {
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery<ChatSession[]>({
  queryKey: ["chatHistory"],
  queryFn: async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/chat/history`
    );
    const json = await res.json();
    return json?.data ?? [];
  },
  refetchInterval: 5000,
});

  const deleteMutation = useMutation({
  mutationFn: async (sessionId: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/chat/${sessionId}`,
      { method: "DELETE" }
    );
    if (!res.ok) throw new Error("Failed to delete");
    return sessionId;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
  }
});

  const handleItemClick = (callback: () => void) => {
    callback();
    // Only auto-close on mobile
    if (window.innerWidth < 768) { 
      onClose();
    }
  };

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
          bg-white/80 backdrop-blur-3xl border-r border-white/50 shadow-[10px_0_40px_rgba(0,0,0,0.05)]
          transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
          ${isOpen ? "translate-x-0 ml-0" : "-translate-x-full md:-ml-80"}
        `}
      >
        <div className="p-6 pb-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#0dafbc] to-[#dfc550] flex items-center justify-center text-white shadow-lg shadow-[#0dafbc]/30">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">CoverChat</h2>
              </div>
            </div>
            {/* CLOSE BUTTON */}
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-[#0dafbc] transition rounded-lg hover:bg-slate-100" title="Close Sidebar">
              <PanelLeftClose size={20} />
            </button>
          </div>

          <button
            onClick={() => handleItemClick(onNewChat)}
            className="w-full py-3.5 bg-gradient-to-r from-[#0dafbc] to-[#00c2cb] hover:shadow-lg hover:shadow-[#0dafbc]/30 text-white rounded-2xl flex items-center justify-center gap-2 font-medium transition-all duration-300 transform active:scale-95 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" /> 
            Start New Chat
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 custom-scrollbar">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">History</p>
          
          {isLoading && (
            <div className="flex justify-center py-4 text-[#0dafbc]">
              <Loader2 className="animate-spin" />
            </div>
          )}

          {sessions.map((chat) => (
            <div 
              key={chat.session_id} 
              className={`group flex items-center w-full px-4 py-3 rounded-2xl transition-all duration-300 border cursor-pointer
                ${currentSessionId === chat.session_id
                  ? "bg-[#0dafbc]/10 border-[#0dafbc]/30 text-[#0dafbc] shadow-sm"
                  : "bg-transparent border-transparent text-slate-600 hover:bg-white/50 hover:border-white"
                }
              `}
              onClick={() => handleItemClick(() => onSelectChat(chat.session_id))}
            >
              <MessageSquare size={18} className={`shrink-0 ${currentSessionId === chat.session_id ? "fill-current" : "opacity-50"}`} />
              <span className="truncate text-sm font-medium flex-1 ml-3">{chat.title}</span>
              
              {/* DELETE BUTTON */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if(confirm("Delete this chat history?")) deleteMutation.mutate(chat.session_id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded-lg transition-all"
                title="Delete Chat"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
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