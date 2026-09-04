import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  Wallet,
  Users,
  Clock,
  ExternalLink,
  Star,
  Briefcase,
} from 'lucide-react';
import freelancerService, {
  FreelancerProject,
  FreelancerEmployer,
} from '../services/freelancer.service';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import Loader from '../components/common/Loader';

const JOBS_ROUTE = '/dashboard?tab=profile';

/**
 * One Freelancer.com job, read inside Knowverd.
 *
 * Deliberately public: the underlying endpoints need no token, so a learner can
 * read a listing in their own language before they have a Freelancer.com
 * account at all. Connecting is only required to act on it, which is why the
 * apply prompt is the one thing gated behind a connection.
 */
export const FreelancerJobPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language].freelancer;

  const [project, setProject] = useState<FreelancerProject | null>(null);
  const [employer, setEmployer] = useState<FreelancerEmployer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const projectId = Number(id);
    if (!Number.isInteger(projectId) || projectId <= 0) {
      setError(t.jobNotFound);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const detail = await freelancerService.getProject(projectId);
        if (cancelled) return;
        setProject(detail.project);
        setEmployer(detail.employer);
      } catch {
        if (!cancelled) setError(t.jobLoadError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, t.jobLoadError, t.jobNotFound]);

  if (loading) return <Loader />;

  if (error || !project) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate(JOBS_ROUTE)}
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.jobBack}
        </button>
        <div className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error || t.jobLoadError}</p>
        </div>
      </div>
    );
  }

  const currency = project.currency?.code ?? '';
  const min = project.budget?.minimum;
  const max = project.budget?.maximum;
  const budget =
    min != null && max != null ? `${min} – ${max} ${currency}` : min != null ? `${min}+ ${currency}` : '—';

  const isClosed =
    project.frontend_project_status != null && project.frontend_project_status !== 'open';

  const postedAt = project.time_submitted ?? project.submitdate;
  const postedLabel = postedAt
    ? new Date(postedAt * 1000).toLocaleDateString(language === 'en' ? undefined : language)
    : '—';

  const rating = employer?.employer_reputation?.entire_history?.overall ?? 0;
  const reviewCount = employer?.employer_reputation?.entire_history?.reviews ?? 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(JOBS_ROUTE)}
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {t.jobBack}
      </button>

      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-subtle px-3 py-1 text-xs font-medium text-accent">
            <Briefcase className="w-3.5 h-3.5" />
            {project.type === 'hourly' ? t.jobHourly : t.jobFixed}
          </span>
          {isClosed && (
            <span className="rounded-full bg-surface-secondary px-3 py-1 text-xs font-medium text-text-muted">
              {t.jobClosed}
            </span>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary break-words">
          {project.title}
        </h1>
      </header>

      {/* Facts a learner needs to judge whether this job is worth their time. */}
      <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="rounded-lg border border-border bg-surface p-3">
          <dt className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
            <Wallet className="w-3.5 h-3.5" />
            {t.jobBudget}
          </dt>
          <dd className="font-semibold text-text-primary text-sm break-words">{budget}</dd>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3">
          <dt className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
            <Users className="w-3.5 h-3.5" />
            {t.jobBids}
          </dt>
          <dd className="font-semibold text-text-primary text-sm">
            {project.bid_stats?.bid_count ?? 0}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3">
          <dt className="text-xs text-text-muted mb-1">{t.jobAvgBid}</dt>
          <dd className="font-semibold text-text-primary text-sm break-words">
            {project.bid_stats?.bid_avg
              ? `${Math.round(project.bid_stats.bid_avg)} ${currency}`
              : '—'}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3">
          <dt className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
            <Clock className="w-3.5 h-3.5" />
            {t.jobPosted}
          </dt>
          <dd className="font-semibold text-text-primary text-sm">{postedLabel}</dd>
        </div>
      </dl>

      {project.jobs && project.jobs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-text-primary mb-3">{t.jobSkills}</h2>
          <ul className="flex flex-wrap gap-2">
            {project.jobs.map((skill) => (
              <li
                key={skill.id}
                className="rounded-full bg-surface-secondary px-3 py-1 text-sm text-text-secondary"
              >
                {skill.name}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-text-primary mb-3">{t.jobDescription}</h2>
        <p className="whitespace-pre-wrap leading-relaxed text-text-secondary break-words">
          {project.description || project.preview_description}
        </p>
      </section>

      {employer && (
        <section className="mb-8 rounded-lg border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold text-text-primary mb-3">{t.jobEmployer}</h2>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="font-medium text-text-primary">
              {employer.display_name || employer.username}
            </span>
            {reviewCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-text-secondary">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                {rating.toFixed(1)} ({reviewCount})
              </span>
            ) : (
              <span className="text-text-muted">{t.jobNoRating}</span>
            )}
            {employer.country?.name && (
              <span className="text-text-secondary">{employer.country.name}</span>
            )}
          </div>
        </section>
      )}

      {/* Reading is free; acting needs their own account. */}
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <p className="text-sm text-text-secondary flex-1 min-w-[14rem]">{t.jobConnectPrompt}</p>
        {project.seo_url && (
          <a
            href={`https://www.freelancer.com/projects/${project.seo_url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2 text-sm"
          >
            {t.jobViewOriginal}
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
};

export default FreelancerJobPage;
