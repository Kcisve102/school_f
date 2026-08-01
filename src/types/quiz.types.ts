/**
 * A question as delivered to the client while the quiz is being taken.
 *
 * The answer key is deliberately absent — the server withholds `correctAnswer`
 * and `explanation` until the quiz is submitted. Keeping them off this type
 * makes accidentally relying on them a compile-time error.
 */
export interface Question {
  id: number;
  question: string;
  options: string[];
}

export interface GeneratedQuiz {
  quizId: number;
  questions: Question[];
}

export interface UserAnswer {
  questionId: number;
  selectedOption: number;
}

/**
 * Per-question outcome, returned only after submission.
 * `correctAnswer` is the option *text*, not the index.
 */
export interface QuizResult {
  questionId: number;
  isCorrect: boolean;
  explanation: string;
  correctAnswer: string;
  /** Index the learner picked, or -1 if skipped. Absent on pre-existing attempts. */
  selectedOption?: number;
}

export interface ValidationResponse {
  results: QuizResult[];
  score: number;
  totalQuestions: number;
  percentageScore: number;
}
