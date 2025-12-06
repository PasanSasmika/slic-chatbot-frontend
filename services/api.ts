import { ChatResponse } from "@/types";

const API_URL = "http://localhost:5000/api"; // Your Backend URL

export const ChatService = {
  async sendMessage(message: string, sessionId: string): Promise<string> {
    try {
      const response = await fetch(`${API_URL}/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}` // optional
        },
        body: JSON.stringify({ message, sessionId }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data: ChatResponse = await response.json();
      return data.data.ai; // This must match your backend response structure
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
};
