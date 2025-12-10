import { ChatResponse } from "@/types";

export const ChatService = {
  async sendMessage(message: string, sessionId: string): Promise<string> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // "Authorization": `Bearer ${token}` // optional
          },
          body: JSON.stringify({ message, sessionId }),
        }
      );

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
