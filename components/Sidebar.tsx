"use client";
import React from 'react'; // Removed unused imports
import { useQuery } from '@tanstack/react-query'; // Industrial Data Fetching
import { MessageSquare, Plus, User, Settings, ShieldCheck, Loader2 } from 'lucide-react';

interface Props {
  onNewChat: () => void;
  onSelectChat: (sessionId: string) => void; // New prop to handle clicks
  isOpen: boolean;
  currentSessionId: string;
}

// Define what a Session looks like from API
interface ChatSession {
  session_id: string;
  title: string;
  last_active: string;
}

export const Sidebar: React.FC<Props> = ({ onNewChat, onSelectChat, isOpen, currentSessionId }) => {
  
  // 1. Fetch Real History from Backend
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['chatHistory'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/chat/history');
      const json = await res.json();
      return json.data as ChatSession[];
    },
    // Refresh history every 5 seconds so new chats appear automatically
    refetchInterval: 5000 
  });

  if (!isOpen) return null;

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen border-r border-gray-800 transition-all duration-300">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6 text-blue-400 font-bold text-lg">
          <ShieldCheck /> SLIC CoverChat
        </div>
        
        <button 
          onClick={onNewChat}
          className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-all shadow-md"
        >
          <Plus size={18} /> New Chat
        </button>
      </div>

      {/* Real History List */}
      <div className="flex-1 overflow-y-auto px-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Recent</h3>
        
        {isLoading ? (
          <div className="text-gray-500 text-sm p-4 flex gap-2">
            <Loader2 className="animate-spin" size={16} /> Loading...
          </div>
        ) : (
          <div className="space-y-1">
            {sessions?.map((chat) => (
              <button 
                key={chat.session_id}
                onClick={() => onSelectChat(chat.session_id)}
                className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition truncate
                  ${currentSessionId === chat.session_id ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}
                `}
              >
                <MessageSquare size={16} className="shrink-0" />
                <span className="truncate">{chat.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <button className="flex items-center gap-3 w-full hover:bg-gray-800 p-2 rounded-lg transition text-sm">
          <div className="h-8 w-8 bg-blue-900 rounded-full flex items-center justify-center">
            <User size={16} />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-medium text-white">Kasun Perera</span>
            <span className="text-xs text-gray-400">Online</span>
          </div>
          <Settings size={16} className="ml-auto text-gray-500" />
        </button>
      </div>
    </div>
  );
};