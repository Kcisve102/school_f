import React from 'react';
import { ArrowUpRight, MapPin, Building2 } from 'lucide-react';
import { CareerjetJob } from '../../services/careerjet.service';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

interface CareerjetJobCardProps {
  job: CareerjetJob;
}

/**
 * Careerjet feeds carry HTML entities in titles and excerpts ("&amp;",
 * "&#039;"). Decoding through the DOM rather than a regex handles the numeric
 * forms too, and the string never reaches innerHTML.
 */
const decodeEntities = (text: string): string => {
  const el = document.createElement('textarea');
  el.innerHTML = text;
  return el.value;
};

/** Salary period suffix, e.g. "$18/hr". */
const PERIOD_KEY: Record<string, 'perYear' | 'perMonth' | 'perWeek' | 'perDay' | 'perHour'> = {
  Y: 'perYear',
  M: 'perMonth',
  W: 'perWeek',
  D: 'perDay',
  H: 'perHour',
};

/**
 * One Careerjet listing.
 *
 * This is an outbound anchor, not a router Link: Careerjet's `url` is a tracked
 * redirect through jobviewtrack.com, and applying happens on the employer's own
 * site. There is no in-app detail page to send a learner to.
 */
export const CareerjetJobCard: React.FC<CareerjetJobCardProps> = ({ job }) => {
  const { language } = useLanguage();
  const t = translations[language].careerjet;

  // Careerjet's own formatted string is preferred over rebuilding one from the
  // bounds: it is already localised and carries the currency symbol.
  const period = job.salaryPeriod ? t[PERIOD_KEY[job.salaryPeriod]] : null;
  const salary = job.salary ? `${decodeEntities(job.salary)}${period ? ` ${period}` : ''}` : null;

  return (
    <a
      href={job.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col p-5 bg-surface-secondary rounded-lg border border-border hover:border-border-hover transition-colors h-full"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-semibold text-text-primary text-sm leading-snug">
          {decodeEntities(job.title)}
        </h4>
        {salary && (
          <span className="flex-shrink-0 text-text-secondary text-xs font-mono whitespace-nowrap">
            {salary}
          </span>
        )}
      </div>

      {job.description && (
        <p className="text-sm text-text-secondary leading-relaxed line-clamp-2 mb-3">
          {decodeEntities(job.description)}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3">
        {job.company && (
          <span className="inline-flex items-center gap-1.5 text-text-muted text-xs">
            <Building2 className="w-3 h-3 flex-shrink-0" />
            {decodeEntities(job.company)}
          </span>
        )}
        {job.locations && (
          <span className="inline-flex items-center gap-1.5 text-text-muted text-xs">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {decodeEntities(job.locations)}
          </span>
        )}
      </div>

      <div className="flex items-center justify-end mt-auto pt-1">
        <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary group-hover:text-text-primary transition-colors">
          {t.viewJob}
          <ArrowUpRight className="w-3 h-3" />
        </span>
      </div>
    </a>
  );
};

export default CareerjetJobCard;
