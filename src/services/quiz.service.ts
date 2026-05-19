import api from './api';
import { ApiResponse, Question, UserAnswer, ValidationResponse } from '../types';

export const quizService = {
  generateQuiz: async (videoId: number): Promise<Question[]> => {
    const response = await api.post<
      ApiResponse<{ questions: Question[]; tokensUsed: number }>
    >('/ai/quiz/generate', { videoId });
    return response.data.data!.questions;
  },

  validateAnswers: async (
    questions: Question[],
    userAnswers: UserAnswer[]
  ): Promise<ValidationResponse> => {
    const response = await api.post<ApiResponse<ValidationResponse>>(
      '/ai/quiz/validate',
      { questions, userAnswers }
    );
    return response.data.data!;
  },
};

export default quizService;
