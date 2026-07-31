import api from './api';
import { ApiResponse, GeneratedQuiz, UserAnswer, ValidationResponse } from '../types';

export const quizService = {
  /**
   * Returns a quizId plus questions with no answer key. Pass `regenerate` to
   * force a fresh quiz instead of reusing the cached one for this video.
   */
  generateQuiz: async (videoId: number, regenerate = false): Promise<GeneratedQuiz> => {
    const response = await api.post<ApiResponse<GeneratedQuiz>>('/ai/quiz/generate', {
      videoId,
      regenerate,
    });
    return response.data.data!;
  },

  /**
   * Grades against the answer key stored server-side; the client never holds it.
   */
  validateAnswers: async (
    quizId: number,
    userAnswers: UserAnswer[]
  ): Promise<ValidationResponse> => {
    const response = await api.post<ApiResponse<ValidationResponse>>(
      '/ai/quiz/validate',
      { quizId, userAnswers }
    );
    return response.data.data!;
  },
};

export default quizService;
