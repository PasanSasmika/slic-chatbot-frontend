"use client";
import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import ChatWindow from "@/components/ui/ChatWindow";

export default function Home() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState("");

  // Auto-generate session ID
  useEffect(() => {
    if (!currentSessionId) setCurrentSessionId(`session-${Date.now()}`);
  }, []);

  return (
    <main className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans">
      
      {/* Sidebar - Controlled by State */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentSessionId={currentSessionId}
        onNewChat={() => setCurrentSessionId(`session-${Date.now()}`)}
        onSelectChat={(id) => setCurrentSessionId(id)}
      />

      {/* Main Content */}
      <div className="flex-1 h-full relative">
        <ChatWindow 
          sessionId={currentSessionId} 
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
        />
      </div>
    </main>
  );
}