import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Info, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { profileService } from '../services/profile.service';
import { CareerProfile, CareerProfileSaveInput } from '../types';
import CareerProfileForm, {
  CareerProfileFormValues,
} from '../components/profile/CareerProfileForm';
import ResumePanel from '../components/resume/ResumePanel';
import PlatformHandoffPanel from '../components/profile/PlatformHandoffPanel';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

/**
 * The career profile page.
 *
 * Three states share one editor:
 *   - saved profile        → form seeded from the stored row
 *   - unsaved draft        → form seeded from Gemini, with a notice that
 *                            nothing is stored until the learner saves
 *   - neither              → empty state pointing back at the videos
 *
 * `?attemptId=` drafts immediately on mount, which is how the post-quiz call to
 * action reaches this page.
 */
interface CareerProfilePageProps {
  /**
   * Rendered inside the dashboard's tab strip rather than as its own page.
   * The dashboard already supplies the page heading and horizontal padding,
   * so the standalone header and outer container are dropped to avoid a
   * second title competing with "Welcome back".
   */
  embedded?: boolean;
}

export const CareerProfilePage: React.FC<CareerProfilePageProps> = ({ embedded = false }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = translations[language].profile;

  const [searchParams, setSearchParams] = useSearchParams();
  const attemptIdParam = searchParams.get('attemptId');

  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [draft, setDraft] = useState<CareerProfileFormValues | null>(null);
  const [draftSource, setDraftSource] = useState<{
    videoId: number | null;
    attemptId: number | null;
  }>({ videoId: null, attemptId: null });

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const generateDraft = useCallback(
    async (attemptId: number) => {
      setGenerating(true);
      try {
        const generated = await profileService.generateDraft(attemptId);
        setDraft({
          headline: generated.headline,
          summary: generated.summary,
          skills: generated.skills,
          jobTitles: generated.jobTitles,
        });
        setDraftSource({
          videoId: generated.sourceVideoId,
          attemptId: generated.sourceAttemptId,
        });
      } catch (error: any) {
        // The server sends a user-facing `message` for the Gemini path and a
        // plain `error` for the validation ones (score too low, not your
        // attempt). Prefer whichever it gave us over a generic string.
        const data = error?.response?.data;
        toast.error(data?.message || data?.error || t.generateFailed);
      } finally {
        setGenerating(false);
      }
    },
    [t.generateFailed]
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const existing = await profileService.getProfile();
        if (cancelled) return;
        setProfile(existing);

        // Draft only when asked to, and never over a saved profile: the
        // learner's own edits outrank a fresh generation.
        if (!existing && attemptIdParam) {
          const attemptId = Number(attemptIdParam);
          if (Number.isInteger(attemptId) && attemptId > 0) {
            await generateDraft(attemptId);
          }
        }
      } catch (error) {
        if (!cancelled) console.error('Failed to load career profile:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
    // Runs once: re-drafting on every param change would burn a paid Gemini
    // call each time the URL is tidied below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (input: CareerProfileSaveInput) => {
    setSaving(true);
    try {
      const saved = await profileService.saveProfile(input);
      setProfile(saved);
      setDraft(null);
      toast.success(t.saved);
      // Drop ?attemptId= once saved so a refresh does not look like a fresh
      // draft request. Only that parameter: clearing the whole query string
      // would also drop ?tab=profile and throw the learner back to the
      // dashboard tab the moment they saved.
      if (attemptIdParam) {
        const next = new URLSearchParams(searchParams);
        next.delete('attemptId');
        setSearchParams(next, { replace: true });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || t.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const formValues: CareerProfileFormValues | null = draft
    ? draft
    : profile
    ? {
        headline: profile.headline,
        summary: profile.summary,
        skills: profile.skills,
        jobTitles: profile.job_titles,
      }
    : null;

  const sourceVideoId = draft ? draftSource.videoId : profile?.source_video_id ?? null;
  const sourceAttemptId = draft ? draftSource.attemptId : profile?.source_attempt_id ?? null;

  return (
    <div className={embedded ? 'max-w-3xl' : 'max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16'}>
      {embedded ? (
        profile && (
          <p className="mb-8 text-xs text-text-muted">
            {t.lastUpdated} {new Date(profile.updated_at).toLocaleDateString()}
          </p>
        )
      ) : (
        <header className="mb-8">
          <p className="font-display text-[0.6875rem] uppercase tracking-[0.3em] text-text-muted mb-3">
            {t.eyebrow}
          </p>
          <h1 className="font-display font-medium text-text-primary text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.1] tracking-[-0.03em]">
            {t.title}
          </h1>
          <p className="mt-3 text-sm text-text-secondary max-w-[60ch] leading-relaxed">
            {t.subtitle}
          </p>
          {profile && (
            <p className="mt-3 text-xs text-text-muted">
              {t.lastUpdated} {new Date(profile.updated_at).toLocaleDateString()}
            </p>
          )}
        </header>
      )}

      {/* The profile is written in English regardless of the interface
          language, so say why rather than letting it look like a bug. */}
      <div className="flex gap-3 rounded-lg border border-border bg-surface/60 px-4 py-3 mb-8">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-text-muted" />
        <p className="text-xs text-text-secondary leading-relaxed">{t.englishNotice}</p>
      </div>

      {loading || generating ? (
        <Loader text={generating ? t.generating : t.loading} />
      ) : formValues ? (
        <>
          {draft && (
            <div className="flex gap-3 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 mb-6">
              <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent" />
              <p className="text-xs text-text-secondary leading-relaxed">{t.draftNotice}</p>
            </div>
          )}
          <CareerProfileForm
            // Remounts when switching between a draft and the saved row so the
            // fields reseed instead of keeping stale state.
            key={draft ? 'draft' : `profile-${profile?.id ?? 'none'}`}
            initialValues={formValues}
            sourceVideoId={sourceVideoId}
            sourceAttemptId={sourceAttemptId}
            saving={saving}
            onSave={handleSave}
          />

          {/* Both panels are for a saved profile only. Offering a download or a
              handoff of an unsaved draft would hand the learner a resume that
              the app itself has not kept. */}
          {profile && !draft && (
            <>
              <ResumePanel
                data={{
                  fullName: user?.full_name ?? '',
                  email: user?.email ?? '',
                  headline: profile.headline,
                  summary: profile.summary,
                  skills: profile.skills,
                  jobTitles: profile.job_titles,
                }}
              />
              <PlatformHandoffPanel profile={profile} />
            </>
          )}
        </>
      ) : (
        <div className="rounded-lg border border-border bg-surface/60 px-6 py-12 text-center">
          <h2 className="font-display text-lg text-text-primary mb-2">{t.empty}</h2>
          <p className="text-sm text-text-secondary max-w-[46ch] mx-auto leading-relaxed mb-6">
            {t.emptyDesc}
          </p>
          <Link to="/categories">
            <Button variant="secondary">{t.emptyCta}</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CareerProfilePage;
