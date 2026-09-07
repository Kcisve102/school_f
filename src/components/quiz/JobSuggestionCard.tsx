import React from 'react';
import { JobSuggestion } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

interface JobSuggestionCardProps {
  job: JobSuggestion;
}

export const JobSuggestionCard: React.FC<JobSuggestionCardProps> = ({ job }) => {
  const { language } = useLanguage();
  const t = translations[language].quiz;

  /*
   * Remote-only, because a learner reached by Knowverd generally cannot take a
   * job that requires being somewhere else. Indeed expresses this two ways and
   * both are needed: `l=Remote` sets the location, and `sc` applies the remote
   * *filter* facet — location alone still returns on-site roles that merely
   * mention the word. `attr(DSQF7)` is Indeed's stable id for "Remote".
   */
  const openIndeedSearch = () => {
    const params = new URLSearchParams({
      q: job.keywords,
      l: 'Remote',
      sc: '0kf:attr(DSQF7);',
    });
    window.open(`https://www.indeed.com/jobs?${params}`, '_blank', 'noopener,noreferrer');
  };

  /*
   * Fiverr needs no remote filter: it is a marketplace for work delivered
   * online, so every gig on it is already remote. Adding "remote" to the query
   * would search gig *text* and shrink results for no gain.
   */
  const openFiverrGigCreation = () => {
    const url = `https://www.fiverr.com/start_selling?source=${encodeURIComponent(job.keywords)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="text-left p-4 bg-surface-secondary rounded-lg border border-border hover:border-border-hover transition-colors w-full">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="font-semibold text-text-primary">{job.title}</p>
      </div>
      <p className="text-sm text-text-secondary">{job.blurb}</p>
      <div className="flex items-center gap-4 mt-2">
        <button onClick={openIndeedSearch} className="text-xs text-accent hover:underline">
          {t.viewOnIndeed} →
        </button>
        <button onClick={openFiverrGigCreation} className="text-xs text-accent hover:underline">
          {t.startOnFiverr} →
        </button>
      </div>
    </div>
  );
};

export default JobSuggestionCard;
