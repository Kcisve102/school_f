import React, { useEffect, useState } from 'react';
import JobSuggestionCard from '../quiz/JobSuggestionCard';
import Loader from '../common/Loader';
import historyService from '../../services/history.service';
import { JobSuggestion } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

/**
 * The Jobs tab.
 *
 * Shows the roles suggested for the learner's most recent quiz attempt, so the
 * tab answers "what work does what I've learned lead to?" without making them
 * dig back through history to find it.
 *
 * There is no live-vacancy feed behind this. Each card hands off to a remote
 * job search on its own keywords, which is the honest shape: a generated role
 * is a direction to look in, not a posting we can promise exists.
 */
export const JobsPanel: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language].quiz;
  const tj = translations[language].jobs;

  const [jobs, setJobs] = useState<JobSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const history = await historyService.getHistory();

        /* Attempts are per video, so the newest overall is found by scanning
           every video's attempts rather than trusting the list order. Only
           attempts that actually carry suggestions are candidates. */
        const latest = history
          .flatMap((item) => item.attempts)
          .filter((attempt) => attempt.hasJobSuggestions)
          .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];

        if (!latest) return;

        const suggestions = await historyService.getJobSuggestions(latest.id);
        if (!cancelled) setJobs(suggestions);
      } catch {
        /* Leave the empty state showing: a failed lookup and no attempts yet
           read the same to the learner, and neither is worth an error. */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Loader text={t.findingJobs} />;

  if (jobs.length === 0) {
    return (
      <p className="text-text-secondary leading-relaxed max-w-[46ch]">{tj.noSuggestionsYet}</p>
    );
  }

  return (
    <div>
      <h3 className="font-display font-medium text-text-primary text-base tracking-[-0.02em] mb-4">
        {t.relatedJobs}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {jobs.map((job, i) => (
          <JobSuggestionCard key={`${job.title}-${i}`} job={job} />
        ))}
      </div>
    </div>
  );
};

export default JobsPanel;
