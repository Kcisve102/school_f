import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import freelancerService, {
  FreelancerProject,
  FreelancerStatus,
} from '../../services/freelancer.service';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';
import FreelancerJobCard from './FreelancerJobCard';
import FreelancerConnectPanel from '../profile/FreelancerConnectPanel';

/**
 * The Jobs tab.
 *
 * One thing at a time: before the account is linked this is the connect flow
 * and nothing else, and once linked it is the jobs. Showing both at once was
 * what made the career page unreadable.
 */
export const JobsPanel: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language].freelancer;

  const [status, setStatus] = useState<FreelancerStatus | null>(null);
  const [projects, setProjects] = useState<FreelancerProject[]>([]);
  const [matchedSkills, setMatchedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const current = await freelancerService.getStatus();
        if (cancelled) return;
        setStatus(current);

        // Jobs are only fetched once connected — that is the whole point of
        // the gate, and it keeps the call off the page for learners who have
        // nothing to match against yet.
        if (current.connected) {
          const result = await freelancerService.getRecommended();
          if (cancelled) return;
          setProjects(result.projects);
          setMatchedSkills(result.matchedSkills);
        }
      } catch {
        if (!cancelled) setError(t.jobLoadError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [t.jobLoadError]);

  if (loading) {
    return <Loader2 className="w-5 h-5 text-text-muted animate-spin" />;
  }

  if (!status?.connected) {
    return <FreelancerConnectPanel />;
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-lg text-text-primary mb-2">{t.matchedHeading}</h2>
        {matchedSkills.length > 0 && (
          <p className="text-text-muted text-sm">
            {t.matchedOn} {matchedSkills.join(' · ')}
          </p>
        )}
      </div>

      {error ? (
        <p className="text-text-muted text-sm">{error}</p>
      ) : projects.length === 0 ? (
        <p className="text-text-muted text-sm">{t.matchedEmpty}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id}>
              <FreelancerJobCard project={project} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JobsPanel;
