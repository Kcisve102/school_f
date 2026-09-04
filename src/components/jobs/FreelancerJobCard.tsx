import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users } from 'lucide-react';
import { FreelancerProject } from '../../services/freelancer.service';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

interface FreelancerJobCardProps {
  project: FreelancerProject;
}

/**
 * One real Freelancer.com posting.
 *
 * Shared by the Jobs tab and the quiz result page, which previously showed
 * AI-invented roles linking to an Indeed keyword search. A learner can read
 * the budget and how many people have already bid before spending a proposal
 * on it — that is the difference between a job board and a suggestion.
 */
export const FreelancerJobCard: React.FC<FreelancerJobCardProps> = ({ project }) => {
  const { language } = useLanguage();
  const t = translations[language].freelancer;

  const currency = project.currency?.code ?? '';
  const min = project.budget?.minimum;
  const max = project.budget?.maximum;
  const budget =
    min != null && max != null
      ? `${min}–${max} ${currency}`
      : min != null
        ? `${min}+ ${currency}`
        : null;

  return (
    <Link
      to={`/jobs/${project.id}`}
      className="group flex flex-col p-5 bg-surface-secondary rounded-lg border border-border hover:border-border-hover transition-colors h-full"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-semibold text-text-primary text-sm leading-snug">{project.title}</h4>
        {budget && (
          <span className="flex-shrink-0 text-text-secondary text-xs font-mono whitespace-nowrap">
            {budget}
          </span>
        )}
      </div>

      {project.preview_description && (
        <p className="text-sm text-text-secondary leading-relaxed line-clamp-2 mb-3">
          {project.preview_description}
        </p>
      )}

      {project.jobs && project.jobs.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 mb-3">
          {project.jobs.slice(0, 4).map((skill) => (
            <li
              key={skill.id}
              className="rounded-full bg-surface px-2.5 py-0.5 text-xs text-text-muted"
            >
              {skill.name}
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between gap-4 mt-auto pt-1">
        {project.bid_stats?.bid_count != null && (
          <span className="inline-flex items-center gap-1.5 text-text-muted text-xs">
            <Users className="w-3 h-3" />
            {t.bids.replace('{count}', String(project.bid_stats.bid_count))}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary group-hover:text-text-primary transition-colors">
          {t.jobHeading}
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
};

export default FreelancerJobCard;
