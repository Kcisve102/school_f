import React, { useState, useEffect } from 'react';
import { ValidationResponse, Question, JobSuggestion } from '../../types';
import QuizReviewList from './QuizReviewList';
import JobSuggestionCard from './JobSuggestionCard';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';
import historyService from '../../services/history.service';

const JOB_SUGGESTION_THRESHOLD = 0;

interface QuizResultsProps {
  validationResults: ValidationResponse;
  questions: Question[];
  userAnswers: Map<number, number>;
  onClose: () => void;
  onRetake: () => void;
  /** Generates a brand new set of questions — costs a Gemini call, so it is a
   *  deliberate second action rather than the default retake. */
  onNewQuestions: () => void;
  attemptId: number | null;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  validationResults,
  questions,
  userAnswers,
  onClose,
  onRetake,
  onNewQuestions,
  attemptId,
}) => {
  const { score, totalQuestions, percentageScore, results } = validationResults;
  const passed = percentageScore >= 60;
  const qualifiesForJobs = percentageScore >= JOB_SUGGESTION_THRESHOLD;
  const { language } = useLanguage();
  const t = translations[language].quiz;

  const [jobs, setJobs] = useState<JobSuggestion[] | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobsError, setJobsError] = useState('');
  const [loadingMoreJobs, setLoadingMoreJobs] = useState(false);

  const handleFindJobs = async () => {
    if (!attemptId) return;
    try {
      setLoadingJobs(true);
      setJobsError('');
      const suggestions = await historyService.getJobSuggestions(attemptId);
      setJobs(suggestions);
    } catch (err) {
      setJobsError(t.jobSuggestionsFailed);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    if (qualifiesForJobs && attemptId) {
      handleFindJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  const handleFindMoreJobs = async () => {
    if (!attemptId) return;
    try {
      setLoadingMoreJobs(true);
      const allJobs = await historyService.findMoreJobs(attemptId);
      setJobs(allJobs);
    } catch (err) {
      setJobsError(t.jobSuggestionsFailed);
    } finally {
      setLoadingMoreJobs(false);
    }
  };

  return (
    <div className="w-full max-h-[70vh] overflow-y-auto">
      {/* Score Display */}
      <div className="text-center mb-8">
        <div className="inline-block p-8 bg-accent/10 rounded-lg border border-accent/20">
          <h2 className="text-4xl font-bold text-text-primary mb-2">
            {score}/{totalQuestions}
          </h2>
          <p className="text-2xl font-semibold text-text-secondary mb-4">
            {Math.round(percentageScore)}%
          </p>
          <div
            className={`inline-block px-4 py-2 rounded-full text-white font-semibold ${
              passed ? 'bg-success' : 'bg-warning'
            }`}
          >
            {passed ? t.passed : t.keepLearning}
          </div>
        </div>
      </div>

      {/* Pass/Fail Message */}
      <div className={`p-4 mb-6 rounded-lg border ${passed ? 'bg-success/10 border-success/30' : 'bg-warning/10 border-warning/30'}`}>
        <p className={`text-center font-medium ${passed ? 'text-success' : 'text-warning'}`}>
          {passed ? t.passMessage : t.failMessage}
        </p>
      </div>

      {/* Related Job Opportunities */}
      {qualifiesForJobs && (
        <div className="mb-8 p-6 bg-surface rounded-lg border border-border">
          <h3 className="text-lg font-bold text-text-primary mb-3">{t.relatedJobs}</h3>

          {loadingJobs && (
            <div className="text-center py-6">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent mb-2"></div>
              <p className="text-text-secondary text-sm">{t.findingJobs}</p>
            </div>
          )}

          {!loadingJobs && jobs && jobs.length === 0 && (
            <button
              onClick={handleFindJobs}
              disabled={!attemptId}
              className="px-6 py-2 bg-accent text-bg-primary rounded-lg font-medium hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.findRelatedJobs}
            </button>
          )}

          {jobsError && <p className="text-error mt-2">{jobsError}</p>}

          {jobs && jobs.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {jobs.map((job, i) => (
                  <JobSuggestionCard key={i} job={job} />
                ))}
              </div>

              <button
                onClick={handleFindMoreJobs}
                disabled={loadingMoreJobs || !attemptId}
                className="mt-4 px-6 py-2 bg-surface-secondary text-text-primary rounded-lg font-medium border border-border hover:bg-surface-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMoreJobs ? t.findingMoreJobs : t.findMoreJobs}
              </button>
            </>
          )}
        </div>
      )}

      {/* Questions Review */}
      <QuizReviewList questions={questions} results={results} userAnswers={userAnswers} />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-border">
        <button
          onClick={onRetake}
          className="flex-1 px-6 py-3 bg-accent text-bg-primary font-semibold rounded-lg hover:bg-accent-dark transition-colors duration-200"
        >
          {t.retake}
        </button>
        <button
          onClick={onNewQuestions}
          title={t.newQuestionsHint}
          className="flex-1 px-6 py-3 bg-surface-secondary text-text-primary font-semibold rounded-lg border border-border hover:bg-surface-hover transition-colors duration-200"
        >
          {t.newQuestions}
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-6 py-3 bg-surface-secondary text-text-primary font-semibold rounded-lg hover:bg-surface-hover transition-colors duration-200"
        >
          {t.close}
        </button>
      </div>
    </div>
  );
};

export default QuizResults;
