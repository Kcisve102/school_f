import { Video } from './index';
import { Question, QuizResult } from './quiz.types';
import { JobSuggestion } from './job.types';

export interface QuizAttemptSummary {
  id: number;
  score: number;
  totalQuestions: number;
  percentageScore: number;
  createdAt: string;
  hasJobSuggestions: boolean;
}

export interface WatchHistoryItem {
  video: Video;
  watchedAt: string | null;
  positionSeconds: number;
  completed: boolean;
  attempts: QuizAttemptSummary[];
}

export interface AttemptDetail {
  id: number;
  videoId: number;
  questions: Question[];
  results: QuizResult[];
  score: number;
  totalQuestions: number;
  percentageScore: number;
  jobSuggestions: JobSuggestion[] | null;
  createdAt: string;
}
