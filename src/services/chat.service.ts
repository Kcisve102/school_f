import api from './api';
import { ApiResponse } from '../types';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  response: string;
  tokensUsed: number;
}

export const chatService = {
  /**
   * Send a question to the factory skills chatbot
   * Responses will be in Chinese
   * @param question - User's question about factory assembly line skills
   * @param conversationHistory - Optional previous messages for context
   * @returns AI response in Chinese
   */
  sendMessage: async (
    question: string,
    conversationHistory?: ChatMessage[]
  ): Promise<ChatResponse> => {
    const response = await api.post<ApiResponse<ChatResponse>>('/ai/chat', {
      question,
      conversationHistory,
    });
    return response.data.data!;
  },
};

export default chatService;
