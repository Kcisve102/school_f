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
    /*
      Results is three different shapes pretending to be one column: a score
      that wants to be a hero, a job list that sits happily two-up, and a review
      list several screens tall. Previously all three shared one narrow column
      inside a 70vh scroller nested in the page scroller — two scrollbars, and
      the score scrolled away the moment you began reading the review.

      The score and actions now hold a sticky rail; the review gets the width.
    */
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start">
      <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24">
        <p className="font-display text-[0.6875rem] uppercase tracking-[0.3em] text-text-muted mb-5">
          {passed ? t.passed : t.keepLearning}
        </p>

        {/* The score is the one display object in the quiz flow, so it is set at
            display scale rather than boxed in a tinted panel. */}
        <p className="font-display font-medium text-text-primary text-[clamp(3rem,9vw,6rem)] leading-[0.85] tracking-[-0.04em] tabular-nums">
          {score}<span className="text-text-muted">/{totalQuestions}</span>
        </p>
        <p className="font-display text-text-secondary text-2xl tracking-[-0.02em] tabular-nums mt-4">
          {Math.round(percentageScore)}%
        </p>

        <div className={`mt-6 border-l-2 pl-4 ${passed ? 'border-success' : 'border-warning'}`}>
          <p className={`text-sm leading-relaxed ${passed ? 'text-success' : 'text-warning'}`}>
            {passed ? t.passMessage : t.failMessage}
          </p>
        </div>

        <div className="flex flex-col gap-px mt-8">
          <button
            onClick={onRetake}
            className="w-full bg-white text-[#16171b] px-6 py-4 font-display text-xs uppercase tracking-[0.15em] transition-colors hover:bg-white/85 focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
          >
            {t.retake}
          </button>
          <button
            onClick={onNewQuestions}
            title={t.newQuestionsHint}
            className="w-full border border-border-hover px-6 py-4 font-display text-xs uppercase tracking-[0.15em] text-text-primary transition-colors hover:bg-surface-hover hover:border-text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
          >
            {t.newQuestions}
          </button>
          <button
            onClick={onClose}
            className="w-full border border-border-subtle px-6 py-4 font-display text-xs uppercase tracking-[0.15em] text-text-muted transition-colors hover:text-text-primary hover:border-border-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
          >
            {t.close}
          </button>
        </div>
      </div>

      <div className="lg:col-span-8 xl:col-span-9 min-w-0">

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
      </div>
    </div>
  );
};

export default QuizResults;
