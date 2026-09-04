import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { JobSuggestion } from '../../types/job.types';
import freelancerService, { FreelancerProject } from '../../services/freelancer.service';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';
import FreelancerJobCard from './FreelancerJobCard';

interface RelatedFreelancerJobsProps {
  suggestions: JobSuggestion[];
}

/**
 * Real Freelancer.com postings for a quiz attempt.
 *
 * The generated suggestions describe roles that might exist and linked to an
 * Indeed keyword search; these are jobs that exist right now, with a budget
 * and a bid count. The generated `keywords` are still what drives the match —
 * they are resolved against Freelancer's skill taxonomy server-side, because
 * a plain text search returns anything with the word in its description.
 *
 * Renders nothing at all when there is no match, rather than an empty shell:
 * the section only earns its space when it has real work in it.
 */
export const RelatedFreelancerJobs: React.FC<RelatedFreelancerJobsProps> = ({ suggestions }) => {
  const { language } = useLanguage();
  const t = translations[language].freelancer;

  const [projects, setProjects] = useState<FreelancerProject[]>([]);
  const [loading, setLoading] = useState(true);

  const keywords = suggestions
    .flatMap((s) => (s.keywords || '').split(/[,;]/))
    .map((k) => k.trim())
    .filter(Boolean);

  const keywordKey = keywords.join(',');

  useEffect(() => {
    if (keywords.length === 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const result = await freelancerService.getRecommended(keywordKey.split(','), 6);
        if (!cancelled) setProjects(result.projects);
      } catch {
        // A job board being unreachable must not break the quiz review.
        if (!cancelled) setProjects([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [keywordKey]);

  if (loading) {
    return <Loader2 className="w-4 h-4 text-text-muted animate-spin" />;
  }

  if (projects.length === 0) return null;

  return (
    <div>
      <p className="font-display text-[0.6875rem] uppercase tracking-[0.3em] text-text-muted mb-5">
        {t.matchedHeading}
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projects.map((project) => (
          <li key={project.id}>
            <FreelancerJobCard project={project} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RelatedFreelancerJobs;
