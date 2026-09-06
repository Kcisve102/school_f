import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import careerjetService, { CareerjetJob } from '../../services/careerjet.service';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';
import CareerjetJobCard from './CareerjetJobCard';

interface CareerjetJobListProps {
  /** Search term. Empty renders nothing at all. */
  query: string;
  /** Optional place, e.g. the learner's city. Empty searches country-wide. */
  location?: string;
  limit?: number;
}

/**
 * Careerjet results for one search term.
 *
 * Renders nothing when there is no term or no result, rather than an empty
 * state: this sits below other job sources, and an "in addition, nothing"
 * block is noise on a small screen.
 */
export const CareerjetJobList: React.FC<CareerjetJobListProps> = ({
  query,
  location = '',
  limit = 6,
}) => {
  const { language } = useLanguage();
  const t = translations[language].careerjet;

  const [jobs, setJobs] = useState<CareerjetJob[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setJobs([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    careerjetService
      .searchJobs(term, { limit, location: location.trim() || undefined })
      .then((result) => {
        if (!cancelled) setJobs(result.jobs);
      })
      .catch(() => {
        // A job board being down is not an error the learner can act on, and
        // this is supplementary to the jobs already on the page. Stay silent.
        if (!cancelled) setJobs([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query, location, limit]);

  if (!query.trim()) return null;

  if (loading) {
    return <Loader2 className="w-5 h-5 text-text-muted animate-spin" />;
  }

  if (jobs.length === 0) return null;

  return (
    <section className="mt-8">
      <h3 className="font-display text-lg text-text-primary mb-4">{t.heading}</h3>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {jobs.map((job) => (
          <li key={job.url}>
            <CareerjetJobCard job={job} />
          </li>
        ))}
      </ul>

      {/* Careerjet's terms require visible attribution wherever their listings
          appear. Deliberately text, not their logo image: a blocked or slow
          remote image on 2G would make the attribution silently vanish. */}
      <p className="mt-4 text-xs text-text-muted">
        <a
          href="https://www.careerjet.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-text-secondary transition-colors"
        >
          {t.poweredBy}
        </a>
      </p>
    </section>
  );
};

export default CareerjetJobList;
