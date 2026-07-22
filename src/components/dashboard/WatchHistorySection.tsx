import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WatchHistoryItem, AttemptDetail, JobSuggestionWithStatus } from '../../types';
import historyService from '../../services/history.service';
import QuizReviewList from '../quiz/QuizReviewList';
import JobSuggestionCard from '../quiz/JobSuggestionCard';
import { formatDate } from '../../utils/helpers';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';
import { PlayCircle, Trophy, Clock, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';

export const WatchHistorySection: React.FC = () => {
  const [items, setItems] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAttemptId, setExpandedAttemptId] = useState<number | null>(null);
  const [detailCache, setDetailCache] = useState<Map<number, AttemptDetail>>(new Map());
  const [detailLoading, setDetailLoading] = useState(false);
  const [jobStatuses, setJobStatuses] = useState<Map<number, JobSuggestionWithStatus[]>>(new Map());
  const [checkingJobs, setCheckingJobs] = useState(false);
  const [findingMoreJobsFor, setFindingMoreJobsFor] = useState<number | null>(null);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language].history;
  const tq = translations[language].quiz;

  useEffect(() => {
    historyService
      .getHistory()
      .then(setItems)
      .catch((err) => console.error('Failed to load history:', err))
      .finally(() => setLoading(false));
  }, []);

  const toggleAttempt = async (attemptId: number) => {
    if (expandedAttemptId === attemptId) {
      setExpandedAttemptId(null);
      return;
    }

    setExpandedAttemptId(attemptId);

    if (!detailCache.has(attemptId)) {
      try {
        setDetailLoading(true);
        const detail = await historyService.getAttemptDetail(attemptId);
        setDetailCache((prev) => new Map(prev).set(attemptId, detail));
      } catch (err) {
        console.error('Failed to load attempt detail:', err);
      } finally {
        setDetailLoading(false);
      }
    }

    try {
      setCheckingJobs(true);
      const checked = await historyService.checkJobValidity(attemptId);
      setJobStatuses((prev) => new Map(prev).set(attemptId, checked));
    } catch (err) {
      console.error('Failed to check job validity:', err);
    } finally {
      setCheckingJobs(false);
    }
  };

  const handleFindMoreJobs = async (attemptId: number) => {
    try {
      setFindingMoreJobsFor(attemptId);
      const allJobs = await historyService.findMoreJobs(attemptId);
      setDetailCache((prev) => {
        const existing = prev.get(attemptId);
        if (!existing) return prev;
        return new Map(prev).set(attemptId, { ...existing, jobSuggestions: allJobs });
      });
      // Newly appended jobs have no validity status yet until re-checked.
      setJobStatuses((prev) => {
        const next = new Map(prev);
        next.delete(attemptId);
        return next;
      });
    } catch (err) {
      console.error('Failed to find more jobs:', err);
    } finally {
      setFindingMoreJobsFor(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="mb-8 reveal-up">
      <h2 className="text-xl lg:text-2xl font-bold text-text-primary mb-6">{t.title}</h2>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-xl border border-border">
          <PlayCircle className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary text-lg">{t.empty}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(({ video, watchedAt, attempts }) => (
            <div key={video.id} className="bg-surface rounded-xl p-5 border border-border">
              <div className="flex items-center justify-between mb-3 gap-4 flex-wrap">
                <button
                  onClick={() => navigate(`/video/${video.id}`)}
                  className="text-lg font-semibold text-text-primary hover:text-accent transition-colors text-left"
                >
                  {video.title}
                </button>
                <div className="flex items-center gap-3">
                  {watchedAt && (
                    <span className="text-sm text-text-muted flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {t.watchedOn} {formatDate(watchedAt)}
                    </span>
                  )}
                  <button
                    onClick={() => navigate(`/video/${video.id}/quiz`)}
                    className="px-4 py-1.5 bg-accent text-white text-sm rounded-lg font-medium hover:bg-accent-dark transition-colors"
                  >
                    {attempts.length === 0 ? t.takeQuiz : t.retakeQuiz}
                  </button>
                </div>
              </div>

              {attempts.length === 0 ? (
                <p className="text-sm text-text-muted">{t.noQuiz}</p>
              ) : (
                <div className="space-y-2">
                  {attempts.map((a) => {
                    const isExpanded = expandedAttemptId === a.id;
                    const detail = detailCache.get(a.id);
                    const statuses = jobStatuses.get(a.id);
                    const jobsToRender = statuses ?? detail?.jobSuggestions ?? [];

                    return (
                      <div key={a.id} className="bg-surface-secondary rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleAttempt(a.id)}
                          className="w-full flex items-center justify-between px-3 py-2 hover:bg-surface-hover transition-colors"
                        >
                          <span className="flex items-center gap-2 text-sm text-text-secondary">
                            <Trophy className="w-4 h-4 text-success" />
                            {a.score}/{a.totalQuestions} ({Math.round(a.percentageScore)}%)
                          </span>
                          <span className="text-xs text-text-muted flex items-center gap-3">
                            {formatDate(a.createdAt)}
                            {a.hasJobSuggestions && <Briefcase className="w-4 h-4 text-accent" />}
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="px-3 pb-4 pt-2 border-t border-border">
                            {detailLoading && !detail ? (
                              <div className="text-center py-6">
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-accent mb-2"></div>
                                <p className="text-text-secondary text-sm">{t.loadingDetail}</p>
                              </div>
                            ) : detail ? (
                              <div className="space-y-6">
                                {jobsToRender.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-bold text-text-primary mb-2">{tq.relatedJobs}</h4>
                                    {checkingJobs && !statuses && (
                                      <p className="text-xs text-text-muted mb-2">{tq.jobStatusChecking}</p>
                                    )}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                      {jobsToRender.map((job, i) => (
                                        <JobSuggestionCard key={i} job={job} />
                                      ))}
                                    </div>
                                    <button
                                      onClick={() => handleFindMoreJobs(a.id)}
                                      disabled={findingMoreJobsFor === a.id}
                                      className="px-4 py-1.5 bg-surface text-text-primary text-sm rounded-lg font-medium border border-border hover:bg-surface-hover transition-colors disabled:opacity-50"
                                    >
                                      {findingMoreJobsFor === a.id ? tq.findingMoreJobs : tq.findMoreJobs}
                                    </button>
                                  </div>
                                )}

                                <QuizReviewList questions={detail.questions} results={detail.results} />
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchHistorySection;
