import React from 'react';
import { JobSuggestion, JobSuggestionWithStatus } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

interface JobSuggestionCardProps {
  job: JobSuggestion | JobSuggestionWithStatus;
}

function hasStatus(job: JobSuggestion | JobSuggestionWithStatus): job is JobSuggestionWithStatus {
  return 'status' in job;
}

export const JobSuggestionCard: React.FC<JobSuggestionCardProps> = ({ job }) => {
  const { language } = useLanguage();
  const t = translations[language].quiz;

  const openIndeedSearch = () => {
    const url = `https://www.indeed.com/jobs?q=${encodeURIComponent(job.keywords)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={openIndeedSearch}
      className="text-left p-4 bg-surface-secondary rounded-lg border border-border hover:border-accent/40 transition-colors w-full"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="font-semibold text-text-primary">{job.title}</p>
        {hasStatus(job) && (
          <span
            className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
              job.status === 'active'
                ? 'bg-success/10 text-success'
                : 'bg-text-muted/10 text-text-muted'
            }`}
          >
            {job.status === 'active' ? t.jobStatusActive : t.jobStatusUnavailable}
          </span>
        )}
      </div>
      <p className="text-sm text-text-secondary">{job.blurb}</p>
      <p className="text-xs text-accent mt-2">{t.viewOnIndeed} →</p>
    </button>
  );
};

export default JobSuggestionCard;
