import api from './api';
import {
  ApiResponse,
  Question,
  QuizResult,
  WatchHistoryItem,
  JobSuggestion,
  JobSuggestionWithStatus,
  AttemptDetail,
} from '../types';

export const historyService = {
  recordWatch: async (videoId: number): Promise<void> => {
    await api.post<ApiResponse>('/history/watch', { videoId });
  },

  recordQuizAttempt: async (
    videoId: number,
    questions: Question[],
    results: QuizResult[],
    score: number,
    totalQuestions: number,
    percentageScore: number
  ): Promise<{ attemptId: number }> => {
    const response = await api.post<ApiResponse<{ attemptId: number }>>(
      '/history/quiz-attempts',
      { videoId, questions, results, score, totalQuestions, percentageScore }
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

  checkJobValidity: async (attemptId: number): Promise<JobSuggestionWithStatus[]> => {
    const response = await api.post<ApiResponse<{ jobs: JobSuggestionWithStatus[] }>>(
      `/history/quiz-attempts/${attemptId}/jobs/check`
    );
    return response.data.data!.jobs;
  },

  findMoreJobs: async (attemptId: number): Promise<JobSuggestion[]> => {
    const response = await api.post<ApiResponse<{ jobs: JobSuggestion[] }>>(
      `/history/quiz-attempts/${attemptId}/jobs/more`
    );
    return response.data.data!.jobs;
  },
};

export default historyService;
