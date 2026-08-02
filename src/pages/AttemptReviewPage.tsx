import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { AttemptDetail } from '../types';
import historyService from '../services/history.service';
import { formatDate } from '../utils/helpers';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import Loader from '../components/common/Loader';
import QuizReviewList from '../components/quiz/QuizReviewList';
import JobSuggestionCard from '../components/quiz/JobSuggestionCard';

const HISTORY_ROUTE = '/dashboard?tab=history';

/**
 * One quiz attempt, reviewed at full page width.
 *
 * This was previously a sticky rail beside the history list, which was the wrong
 * container for it: job blurbs run several lines each and the review list is many
 * screens tall, so both were squeezed into ~450px while the list beside them sat
 * half empty. The shapes are inverted here — the score is the narrow object and
 * takes the rail, the jobs and the review take the width.
 *
 * `QuizResults` is deliberately not reused: it requires retake/new-question
 * callbacks that mean nothing for a historical attempt, and it re-fetches job
 * suggestions on mount even though `AttemptDetail` already carries them.
 */
export const AttemptReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const t = translations[language].history;
  const tq = translations[language].quiz;

  const [detail, setDetail] = useState<AttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [findingMoreJobs, setFindingMoreJobs] = useState(false);

  /* The attempt payload carries no video title, and fetching the video purely to
     print a heading is a round trip for one string. The history row passes it
     through router state instead; a cold open (deep link, refresh) falls back to
     a generic heading rather than blocking the page on it. */
  const passedTitle = (location.state as { videoTitle?: string } | null)?.videoTitle;

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;

      try {
        const data = await historyService.getAttemptDetail(parseInt(id));
        setDetail(data);
      } catch (err: any) {
        setError(err.response?.data?.error || t.attemptNotFoundDesc);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleFindMoreJobs = async () => {
    if (!detail) return;
    try {
      setFindingMoreJobs(true);
      const allJobs = await historyService.findMoreJobs(detail.id);
      setDetail((prev) => (prev ? { ...prev, jobSuggestions: allJobs } : prev));
    } catch (err) {
      console.error('Failed to find more jobs:', err);
    } finally {
      setFindingMoreJobs(false);
    }
  };

  const backButton = (
    <button
      onClick={() => navigate(HISTORY_ROUTE)}
      className="group inline-flex items-center gap-3 min-h-[44px] py-2 font-display text-[0.6875rem] uppercase tracking-[0.2em] text-text-muted hover:text-text-primary transition-colors mb-6"
    >
      <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
      {t.backToHistory}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen px-6 lg:px-12 xl:px-20 py-12 sm:py-20">
        <div className="max-w-[1600px]">
          {backButton}
          <Loader text={t.loadingDetail} />
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="min-h-screen px-6 lg:px-12 xl:px-20 py-12 sm:py-20">
        <div className="max-w-[1600px]">
          {backButton}
          <div className="py-20 max-w-[46ch]">
            <AlertCircle className="w-8 h-8 text-error mb-6" strokeWidth={1.5} />
            <h1 className="font-display font-medium text-text-primary text-xl tracking-[-0.02em] mb-3">
              {t.attemptNotFound}
            </h1>
            <p className="text-text-secondary leading-relaxed">{error || t.attemptNotFoundDesc}</p>
          </div>
        </div>
      </div>
    );
  }

  const passed = detail.percentageScore >= 60;
  const jobs = detail.jobSuggestions ?? [];

  return (
    <div className="min-h-screen px-6 lg:px-12 xl:px-20 py-12 sm:py-20">
      <div className="max-w-[1600px]">
        {backButton}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start">
          <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 min-w-0">
            <p className="font-display text-[0.6875rem] uppercase tracking-[0.3em] text-text-muted mb-5">
              {t.attemptReview}
            </p>
            <h1 className="font-display font-medium text-text-primary text-[clamp(1.25rem,2.5vw,1.75rem)] leading-[1.15] tracking-[-0.03em] break-words">
              {passedTitle || t.untitledVideo}
            </h1>
            <p className="font-display text-[0.625rem] uppercase tracking-[0.15em] text-text-muted mt-4">
              {t.attemptOn} {formatDate(detail.createdAt)}
            </p>

            {/* The score is the one display object on the page. */}
            <p className="font-display font-medium text-text-primary text-[clamp(3rem,9vw,6rem)] leading-[0.85] tracking-[-0.04em] tabular-nums mt-10">
              {detail.score}
              <span className="text-text-muted">/{detail.totalQuestions}</span>
            </p>
            <p className="font-display text-text-secondary text-2xl tracking-[-0.02em] tabular-nums mt-4">
              {Math.round(detail.percentageScore)}%
            </p>

            <div className={`mt-6 border-l-2 pl-4 ${passed ? 'border-success' : 'border-warning'}`}>
              <p className={`text-sm leading-relaxed ${passed ? 'text-success' : 'text-warning'}`}>
                {passed ? tq.passMessage : tq.failMessage}
              </p>
            </div>

            <div className="flex flex-col gap-px mt-8">
              <button
                onClick={() => navigate(`/video/${detail.videoId}/quiz`)}
                className="w-full bg-white text-[#16171b] px-6 py-4 font-display text-xs uppercase tracking-[0.15em] transition-colors hover:bg-white/85 focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
              >
                {tq.retake}
              </button>
              <button
                onClick={() => navigate(`/video/${detail.videoId}`)}
                className="w-full border border-border-subtle px-6 py-4 font-display text-xs uppercase tracking-[0.15em] text-text-muted transition-colors hover:text-text-primary hover:border-border-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
              >
                {translations[language].videoDetail.backToVideos}
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 xl:col-span-9 min-w-0">
            {jobs.length > 0 && (
              <div className="mb-12">
                <p className="font-display text-[0.6875rem] uppercase tracking-[0.3em] text-text-muted mb-5">
                  {tq.relatedJobs}
                </p>
                {/* Two-up: the width this content never had in the rail. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {jobs.map((job, i) => (
                    <JobSuggestionCard key={i} job={job} />
                  ))}
                </div>
                <button
                  onClick={handleFindMoreJobs}
                  disabled={findingMoreJobs}
                  className="mt-4 border border-border-hover px-6 py-4 font-display text-xs uppercase tracking-[0.15em] text-text-primary transition-colors hover:bg-surface-hover hover:border-text-primary disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
                >
                  {findingMoreJobs ? tq.findingMoreJobs : tq.findMoreJobs}
                </button>
              </div>
            )}

            <QuizReviewList questions={detail.questions} results={detail.results} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttemptReviewPage;
