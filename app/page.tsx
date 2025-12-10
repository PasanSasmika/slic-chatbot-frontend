"use client";
import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import ChatWindow from "@/components/ui/ChatWindow"; 

export default function Home() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState("");

  // Initial Logic: Close on Mobile, Open on Desktop
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  // Auto-generate session ID
  useEffect(() => {
    if (!currentSessionId) setCurrentSessionId(`session-${Date.now()}`);
  }, [currentSessionId]);

  return (
    <main className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans">
      
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentSessionId={currentSessionId}
        onNewChat={() => setCurrentSessionId(`session-${Date.now()}`)}
        onSelectChat={(id) => setCurrentSessionId(id)}
      />

      {/* Main Content Area */}
      <div className="flex-1 h-full relative flex flex-col transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]">
        <ChatWindow 
          sessionId={currentSessionId} 
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
          isSidebarOpen={isSidebarOpen}
        />
      </div>
    </main>
  );
}