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

  const openIndeedSearch = () => {
    const url = `https://www.indeed.com/jobs?q=${encodeURIComponent(job.keywords)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openFiverrGigCreation = () => {
    const url = `https://www.fiverr.com/start_selling?source=${encodeURIComponent(job.keywords)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="text-left p-4 bg-surface-secondary rounded-lg border border-border hover:border-accent/40 transition-colors w-full">
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
