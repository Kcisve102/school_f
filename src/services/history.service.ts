import api from './api';
import {
  ApiResponse,
  UserAnswer,
  ValidationResponse,
  WatchHistoryItem,
  JobSuggestion,
  AttemptDetail,
} from '../types';

export const historyService = {
  recordWatch: async (videoId: number): Promise<void> => {
    await api.post<ApiResponse>('/history/watch', { videoId });
  },

  /**
   * The server re-grades from the stored answer key, so no score is sent —
   * it returns the authoritative result.
   */
  recordQuizAttempt: async (
    videoId: number,
    quizId: number,
    userAnswers: UserAnswer[]
  ): Promise<{ attemptId: number } & ValidationResponse> => {
    const response = await api.post<ApiResponse<{ attemptId: number } & ValidationResponse>>(
      '/history/quiz-attempts',
      { videoId, quizId, userAnswers }
    );
    return response.data.data!;
  },

  getHistory: async (): Promise<WatchHistoryItem[]> => {
    const response = await api.get<ApiResponse<WatchHistoryItem[]>>('/history');
    return response.data.data!;
  },

  getJobSuggestions: async (attemptId: number): Promise<JobSuggestion[]> => {
    const response = await api.post<ApiResponse<{ jobs: JobSuggestion[]; cached: boolean }>>(
      `/history/quiz-attempts/${attemptId}/jobs`
    );
    return response.data.data!.jobs;
  },

  getAttemptDetail: async (attemptId: number): Promise<AttemptDetail> => {
    const response = await api.get<ApiResponse<AttemptDetail>>(
      `/history/quiz-attempts/${attemptId}`
    );
    return response.data.data!;
  },

  findMoreJobs: async (attemptId: number): Promise<JobSuggestion[]> => {
    const response = await api.post<ApiResponse<{ jobs: JobSuggestion[] }>>(
      `/history/quiz-attempts/${attemptId}/jobs/more`
    );
    return response.data.data!.jobs;
  },
};

export default historyService;
