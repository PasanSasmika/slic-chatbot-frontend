export interface Message {
  id: string;
  role: 'user' | 'model'; // 'model' matches Gemini's term
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  success: boolean;
  data: {
    user: string;
    ai: string;
  };
}