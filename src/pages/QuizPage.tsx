import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Question, UserAnswer, ValidationResponse } from '../types';
import quizService from '../services/quiz.service';
import historyService from '../services/history.service';
import QuizProgress from '../components/quiz/QuizProgress';
import QuestionCard from '../components/quiz/QuestionCard';
import QuizResults from '../components/quiz/QuizResults';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

type QuizState = 'loading' | 'answering' | 'submitting' | 'results';

export const QuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const videoId = parseInt(id!);
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<number, number>>(new Map());
  const [quizState, setQuizState] = useState<QuizState>('loading');
  const [validationResults, setValidationResults] = useState<ValidationResponse | null>(null);
  const [error, setError] = useState('');
  const [lastAttemptId, setLastAttemptId] = useState<number | null>(null);
  const { language } = useLanguage();
  const t = translations[language].quiz;

  useEffect(() => {
    loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  const loadQuiz = async () => {
    try {
      setError('');
      setQuizState('loading');
      const generatedQuestions = await quizService.generateQuiz(videoId);
      setQuestions(generatedQuestions);
      setUserAnswers(new Map());
      setCurrentQuestionIndex(0);
      setValidationResults(null);
      setLastAttemptId(null);
      setQuizState('answering');
    } catch (err: any) {
      setError(err.response?.data?.message || t.failedToGenerate);
      toast.error(t.failedToGenerate);
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
      toast.error(t.pleaseAnswerAll);
      return;
    }

    try {
      setQuizState('submitting');

      const answersArray: UserAnswer[] = questions.map((q) => ({
        questionId: q.id,
        selectedOption: userAnswers.get(q.id)!,
      }));

      const results = await quizService.validateAnswers(questions, answersArray);
      setValidationResults(results);
      setQuizState('results');

      try {
        const { attemptId } = await historyService.recordQuizAttempt(
          videoId,
          questions,
          results.results,
          results.score,
          results.totalQuestions,
          results.percentageScore
        );
        setLastAttemptId(attemptId);
      } catch (saveErr) {
        console.error('Failed to save quiz attempt:', saveErr);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t.failedToValidate);
      toast.error(t.failedToValidate);
      console.error('Answer validation error:', err);
      setQuizState('answering');
    }
  };

  const handleRetake = () => {
    loadQuiz();
  };

  const handleClose = () => {
    navigate('/dashboard');
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? userAnswers.get(currentQuestion.id) ?? null : null;
  const allQuestionsAnswered = userAnswers.size === questions.length;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-2xl mx-auto bg-bg-primary rounded-lg border border-border overflow-hidden">
        <div className="bg-surface px-6 py-4 border-b border-border">
          <h1 className="text-2xl font-bold text-text-primary">{t.title}</h1>
        </div>

        <div className="px-6 py-6">
          {quizState === 'loading' && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
              <p className="text-text-secondary">{t.generating}</p>
            </div>
          )}

          {error && quizState === 'loading' && (
            <div className="text-center py-12">
              <div className="text-error mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-text-primary font-medium mb-2">{t.generationFailed}</p>
              <p className="text-text-secondary mb-4">{error}</p>
              <button
                onClick={loadQuiz}
                className="px-6 py-2 bg-accent text-bg-primary rounded-lg hover:bg-accent-dark transition-colors"
              >
                {t.tryAgain}
              </button>
            </div>
          )}

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

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    currentQuestionIndex === 0
                      ? 'bg-surface-secondary text-text-muted cursor-not-allowed'
                      : 'bg-surface-secondary text-text-primary hover:bg-surface-hover'
                  }`}
                >
                  {t.previous}
                </button>

                {currentQuestionIndex === questions.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!allQuestionsAnswered}
                    className={`px-8 py-2 rounded-lg font-semibold transition-colors ${
                      allQuestionsAnswered
                        ? 'bg-success text-white hover:bg-success/80'
                        : 'bg-surface-secondary text-text-muted cursor-not-allowed'
                    }`}
                  >
                    {t.submitQuiz}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-accent text-bg-primary rounded-lg font-medium hover:bg-accent-dark transition-colors"
                  >
                    {t.next}
                  </button>
                )}
              </div>

              <div className="mt-4 text-center text-sm text-text-muted">
                {t.of} {userAnswers.size} / {questions.length} {t.questionsAnswered}
              </div>
            </div>
          )}

          {quizState === 'submitting' && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
              <p className="text-text-secondary">{t.analyzing}</p>
            </div>
          )}

          {quizState === 'results' && validationResults && (
            <QuizResults
              validationResults={validationResults}
              questions={questions}
              userAnswers={userAnswers}
              onClose={handleClose}
              onRetake={handleRetake}
              attemptId={lastAttemptId}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
