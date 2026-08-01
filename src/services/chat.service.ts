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
   * Ask the AI assistant a question. Responses are in Chinese.
   *
   * Passing `videoId` scopes the question to that lesson — the server grounds
   * the answer in its transcript. Omitting it uses the general AI tutor.
   *
   * Conversation history is not sent: the server loads it from the database
   * keyed on the session user.
   */
  sendMessage: async (
    question: string,
    videoId?: number
  ): Promise<ChatResponse> => {
    const response = await api.post<ApiResponse<ChatResponse>>('/ai/chat', {
      question,
      videoId,
    });
    return response.data.data!;
  },

  /** Stored conversation for a thread, so a refresh doesn't lose it. */
  getThread: async (videoId?: number): Promise<ChatMessage[]> => {
    const response = await api.get<ApiResponse<ChatMessage[]>>('/ai/chat/thread', {
      params: videoId === undefined ? {} : { videoId },
    });
    return response.data.data!;
  },

  /** Deletes the stored thread; clearing locally alone would not stick. */
  clearThread: async (videoId?: number): Promise<void> => {
    await api.delete<ApiResponse>('/ai/chat/thread', {
      params: videoId === undefined ? {} : { videoId },
    });
  },
};

export default chatService;
