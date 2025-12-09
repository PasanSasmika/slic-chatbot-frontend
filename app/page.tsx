"use client";
import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Menu } from 'lucide-react';
import ChatWindow from '@/components/ui/ChatWindow';

export default function Home() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  // State to track which chat is active
  // If empty, it means "New Chat"
  const [currentSessionId, setCurrentSessionId] = useState<string>("");

  // Generate a random ID for new chats
  useEffect(() => {
    if (!currentSessionId) {
      setCurrentSessionId(`session-${Date.now()}`);
    }
  }, []);

  const handleNewChat = () => {
    setCurrentSessionId(`session-${Date.now()}`); // Create fresh ID
  };

  return (
    <main className="flex h-screen bg-gray-50 overflow-hidden relative">
      
      {/* Sidebar with Real Data */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <Sidebar 
           onNewChat={handleNewChat} 
           isOpen={true} 
           onSelectChat={setCurrentSessionId} // Switch chat on click
           currentSessionId={currentSessionId}
         />
      </div>

      <div className="flex-1 flex flex-col h-full w-full relative">
        <div className="absolute top-3 left-3 md:hidden z-50">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 bg-white rounded-full shadow-md border border-gray-200">
            <Menu size={20} />
          </button>
        </div>

        {/* Pass the Session ID to the Window */}
        <ChatWindow key={currentSessionId} sessionId={currentSessionId} />
        
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)}></div>
        )}
      </div>
    </main>
  );
}