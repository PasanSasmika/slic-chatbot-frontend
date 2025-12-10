import { ChatResponse } from "@/types";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

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
      return data.data.ai;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
};
