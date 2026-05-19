import React, { useState, useEffect } from 'react';
import { Question, UserAnswer, ValidationResponse } from '../../types';
import quizService from '../../services/quiz.service';
import QuizProgress from './QuizProgress';
import QuestionCard from './QuestionCard';
import QuizResults from './QuizResults';
import toast from 'react-hot-toast';

interface QuizModalProps {
  videoId: number;
  isOpen: boolean;
  onClose: () => void;
}

type QuizState = 'loading' | 'answering' | 'submitting' | 'results';

export const QuizModal: React.FC<QuizModalProps> = ({
  videoId,
  isOpen,
  onClose,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<number, number>>(new Map());
  const [quizState, setQuizState] = useState<QuizState>('loading');
  const [validationResults, setValidationResults] = useState<ValidationResponse | null>(null);
  const [error, setError] = useState('');

  // Load quiz on mount
  useEffect(() => {
    if (isOpen && quizState === 'loading') {
      loadQuiz();
    }
  }, [isOpen]);

  const loadQuiz = async () => {
    try {
      setError('');
      setQuizState('loading');
      const generatedQuestions = await quizService.generateQuiz(videoId);
      setQuestions(generatedQuestions);
      setUserAnswers(new Map());
      setCurrentQuestionIndex(0);
      setValidationResults(null);
      setQuizState('answering');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate quiz. Please try again.');
      toast.error('Failed to generate quiz');
      console.error('Quiz generation error:', err);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (questions.length === 0) return;

    const currentQuestion = questions[currentQuestionIndex];
    const newAnswers = new Map(userAnswers);
    newAnswers.set(currentQuestion.id, optionIndex);
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (userAnswers.size !== questions.length) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    try {
      setQuizState('submitting');

      // Convert Map to array of UserAnswer objects
      const answersArray: UserAnswer[] = questions.map((q) => ({
        questionId: q.id,
        selectedOption: userAnswers.get(q.id)!,
      }));

      const results = await quizService.validateAnswers(questions, answersArray);
      setValidationResults(results);
      setQuizState('results');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to validate answers. Please try again.');
      toast.error('Failed to validate answers');
      console.error('Answer validation error:', err);
      setQuizState('answering');
    }
  };

  const handleRetake = () => {
    loadQuiz();
  };

  const handleClose = () => {
    if (quizState === 'answering' && userAnswers.size > 0) {
      if (window.confirm('Are you sure you want to close? Your progress will be lost.')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? userAnswers.get(currentQuestion.id) ?? null : null;
  const allQuestionsAnswered = userAnswers.size === questions.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Video Quiz</h2>
              <button
                onClick={handleClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Loading State */}
            {quizState === 'loading' && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Generating your quiz...</p>
              </div>
            )}

            {/* Error State */}
            {error && quizState === 'loading' && (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-800 font-medium mb-2">Quiz Generation Failed</p>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={loadQuiz}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Answering State */}
            {quizState === 'answering' && currentQuestion && (
              <div>
                <QuizProgress
                  current={currentQuestionIndex + 1}
                  total={questions.length}
                />

                <QuestionCard
                  question={currentQuestion}
                  selectedOption={currentAnswer}
                  onSelectOption={handleSelectOption}
                />

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      currentQuestionIndex === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Previous
                  </button>

                  {currentQuestionIndex === questions.length - 1 ? (
                    <button
                      onClick={handleSubmit}
                      disabled={!allQuestionsAnswered}
                      className={`px-8 py-2 rounded-lg font-semibold transition-colors ${
                        allQuestionsAnswered
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Next
                    </button>
                  )}
                </div>

                {/* Progress Indicator */}
                <div className="mt-4 text-center text-sm text-gray-600">
                  {userAnswers.size} of {questions.length} questions answered
                </div>
              </div>
            )}

            {/* Submitting State */}
            {quizState === 'submitting' && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Analyzing your answers...</p>
              </div>
            )}

            {/* Results State */}
            {quizState === 'results' && validationResults && (
              <QuizResults
                validationResults={validationResults}
                questions={questions}
                userAnswers={userAnswers}
                onClose={onClose}
                onRetake={handleRetake}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
