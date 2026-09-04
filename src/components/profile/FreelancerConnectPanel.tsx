import { Link } from 'react-router-dom';
import React, { useCallback, useEffect, useState } from 'react';
import { Check, ExternalLink, Loader2, Unlink, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import freelancerService, { FreelancerStatus } from '../../services/freelancer.service';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

const SIGNUP_URL = 'https://www.freelancer.com/signup';

interface FreelancerConnectPanelProps {
  /** Search terms from the learner's generated job suggestions. */
  suggestedKeywords?: string[];
}

/**
 * Freelancer.com is the one destination that is a real connection rather than
 * a click-through, so unlike PlatformHandoffPanel this can honestly report
 * "connected" — their OAuth callback tells us the learner authorised us.
 *
 * The learner still creates their own account on freelancer.com. We never
 * submit a signup for them: an account has to belong to the real person to
 * pass verification and receive payouts.
 */
export const FreelancerConnectPanel: React.FC<FreelancerConnectPanelProps> = ({
  suggestedKeywords = [],
}) => {
  const { language } = useLanguage();
  const t = translations[language].freelancer;

  const [status, setStatus] = useState<FreelancerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      setStatus(await freelancerService.getStatus());
    } catch {
      // A learner who has never connected is the normal case, not an error
      // worth interrupting them over.
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  // The OAuth callback returns the learner here with a result flag. Report it
  // once, then strip it so a refresh does not repeat the toast.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get('freelancer');
    if (!result) return;

    if (result === 'connected') {
      toast.success(t.connectSuccess);
      void loadStatus();
    } else {
      toast.error(t.connectFailed);
    }

    params.delete('freelancer');
    params.delete('reason');
    const query = params.toString();
    window.history.replaceState({}, '', window.location.pathname + (query ? `?${query}` : ''));
  }, [t.connectSuccess, t.connectFailed, loadStatus]);

  const handleDisconnect = async () => {
    setWorking(true);
    try {
      await freelancerService.disconnect();
      setStatus({ connected: false });
      toast.success(t.disconnected);
    } catch {
      toast.error(t.disconnectFailed);
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <section className="mt-12 pt-10 border-t border-border">
        <Loader2 className="w-4 h-4 text-text-muted animate-spin" aria-label={t.heading} />
      </section>
    );
  }

  const connected = status?.connected === true;

  return (
    <section className="mt-12 pt-10 border-t border-border">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display font-medium text-text-primary text-lg tracking-[-0.02em]">
            {t.heading}
          </h2>
          <p className="text-text-secondary text-sm mt-2 max-w-2xl leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {connected && (
          <span className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 border border-border rounded-full text-xs text-text-secondary">
            <Check className="w-3.5 h-3.5" />
            {t.connected}
          </span>
        )}
      </div>

      {connected ? (
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <p className="text-text-secondary text-sm">
            {status?.freelancerUsername
              ? t.connectedAs.replace('{username}', status.freelancerUsername)
              : t.connected}
          </p>
          <button
            onClick={handleDisconnect}
            disabled={working}
            className="flex items-center gap-1.5 min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1 text-xs text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white rounded disabled:opacity-50"
          >
            {working ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Unlink className="w-3.5 h-3.5" />
            )}
            {t.disconnect}
          </button>
        </div>
      ) : (
        // Two ordered steps: the account is created by the learner on
        // freelancer.com, and only then can it be connected here.
        <ol className="mt-6 space-y-3">
          <li className="p-5 bg-surface border border-border rounded-lg">
            <h3 className="text-text-primary text-sm font-medium">
              <span className="text-text-muted mr-2">1.</span>
              {t.step1Title}
            </h3>
            <p className="text-text-secondary text-sm mt-2 leading-relaxed">{t.step1Body}</p>
            <a
              href={SIGNUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 bg-surface-hover border border-border rounded-lg text-sm text-text-primary transition-colors hover:border-border-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
            >
              {t.step1Action}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </li>

          <li className="p-5 bg-surface border border-border rounded-lg">
            <h3 className="text-text-primary text-sm font-medium">
              <span className="text-text-muted mr-2">2.</span>
              {t.step2Title}
            </h3>
            <p className="text-text-secondary text-sm mt-2 leading-relaxed">{t.step2Body}</p>
            <button
              onClick={() => freelancerService.startConnect()}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 bg-white text-black rounded-lg text-sm font-medium transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
            >
              {t.step2Action}
            </button>
          </li>
        </ol>
      )}

      {connected && suggestedKeywords.length > 0 && (
        <FreelancerProjectSearch keywords={suggestedKeywords} />
      )}
    </section>
  );
};

/** Live projects for the learner's generated job keywords. */
const FreelancerProjectSearch: React.FC<{ keywords: string[] }> = ({ keywords }) => {
  const { language } = useLanguage();
  const t = translations[language].freelancer;

  const [active, setActive] = useState(keywords[0] ?? '');
  const [projects, setProjects] = useState<Awaited<
    ReturnType<typeof freelancerService.searchProjects>
  > | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    setLoading(true);
    freelancerService
      .searchProjects(active)
      .then((result) => {
        if (!cancelled) setProjects(result);
      })
      .catch(() => {
        if (!cancelled) {
          toast.error(t.searchFailed);
          setProjects([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [active, t.searchFailed]);

  return (
    <div className="mt-10">
      <h3 className="font-display text-[0.6875rem] uppercase tracking-[0.2em] text-text-muted">
        {t.searchHeading}
      </h3>

      <div className="flex flex-wrap gap-2 mt-4">
        {keywords.map((keyword) => (
          <button
            key={keyword}
            onClick={() => setActive(keyword)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white ${
              keyword === active
                ? 'bg-white text-black border-white'
                : 'bg-surface text-text-secondary border-border hover:border-border-hover'
            }`}
          >
            {keyword}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader2 className="w-4 h-4 text-text-muted animate-spin mt-6" />
      ) : projects && projects.length === 0 ? (
        <p className="text-text-muted text-sm mt-6">{t.searchEmpty}</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {projects?.map((project) => (
            <li key={project.id} className="p-5 bg-surface border border-border rounded-lg">
              <div className="flex items-start justify-between gap-4">
                <h4 className="text-text-primary text-sm font-medium">{project.title}</h4>
                {project.budget?.minimum != null && (
                  <span className="flex-shrink-0 text-text-secondary text-xs font-mono">
                    {project.budget.minimum}
                    {project.budget.maximum ? `–${project.budget.maximum}` : ''}{' '}
                    {project.currency?.code ?? ''}
                  </span>
                )}
              </div>

              {project.preview_description && (
                <p className="text-text-secondary text-sm mt-2 leading-relaxed line-clamp-2">
                  {project.preview_description}
                </p>
              )}

              <div className="flex items-center gap-4 mt-3">
                {project.bid_stats?.bid_count != null && (
                  <span className="text-text-muted text-xs">
                    {t.bids.replace('{count}', String(project.bid_stats.bid_count))}
                  </span>
                )}
                {/* Opens in Knowverd, in the learner's own language, rather
                    than dropping them onto an English page on freelancer.com. */}
                <Link
                  to={`/jobs/${project.id}`}
                  className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
                >
                  {t.jobHeading}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FreelancerConnectPanel;
