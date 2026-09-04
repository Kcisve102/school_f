import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { CareerProfile, HandoffPlatform } from '../../types';
import { HANDOFF_PLATFORMS } from '../../constants/platforms';
import profileService from '../../services/profile.service';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

interface PlatformHandoffPanelProps {
  profile: CareerProfile;
}

/**
 * Formats the profile as the plain text a learner pastes into a job board's
 * own signup form. Labels come from the active language, but this is the one
 * place that stays deliberately simple: no markdown, no bullets a form would
 * render literally.
 */
function buildProfileText(
  profile: CareerProfile,
  labels: {
    summary: string;
    skills: string;
    targets: string;
    experience: string;
    education: string;
    certifications: string;
    present: string;
  }
): string {
  const lines: string[] = [profile.headline, '', `${labels.summary}:`, profile.summary];

  // Everything below is optional, and a section with nothing in it is left out
  // entirely rather than pasted as an empty heading.
  if (profile.experience.length > 0) {
    lines.push('', `${labels.experience}:`);
    for (const job of profile.experience) {
      const dates = [job.start, job.current ? labels.present : job.end].filter(Boolean).join(' — ');
      lines.push(`- ${job.role}, ${job.employer}${dates ? ` (${dates})` : ''}`);
      for (const bullet of job.bullets) lines.push(`  · ${bullet}`);
    }
  }

  if (profile.education.length > 0) {
    lines.push('', `${labels.education}:`);
    for (const item of profile.education) {
      const where = [item.institution, item.end].filter(Boolean).join(', ');
      lines.push(`- ${item.credential}${where ? ` — ${where}` : ''}`);
    }
  }

  if (profile.certifications.length > 0) {
    lines.push('', `${labels.certifications}:`);
    for (const cert of profile.certifications) {
      lines.push(`- ${[cert.name, cert.issuer, cert.issued].filter(Boolean).join(' — ')}`);
    }
  }

  lines.push('', `${labels.skills}: ${profile.skills.join(', ')}`);
  lines.push(`${labels.targets}: ${profile.job_titles.join(', ')}`);

  return lines.join('\n');
}

export const PlatformHandoffPanel: React.FC<PlatformHandoffPanelProps> = ({ profile }) => {
  const { language } = useLanguage();
  const t = translations[language].handoff;
  const tr = translations[language].resume;

  const [copied, setCopied] = useState(false);

  const profileText = buildProfileText(profile, {
    summary: tr.sectionSummary,
    skills: tr.sectionSkills,
    targets: tr.sectionTargets,
    experience: tr.sectionExperience,
    education: tr.sectionEducation,
    certifications: tr.sectionCertifications,
    present: tr.present,
  });

  const copyToClipboard = async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(profileText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
      return true;
    } catch {
      // Clipboard access is denied outside a secure context and in some
      // embedded browsers. The textarea below is the fallback, so say what
      // to do rather than failing silently.
      toast.error(t.copyFailed);
      return false;
    }
  };

  const handleOpen = async (platform: HandoffPlatform, signupUrl: string) => {
    // Opened before the await: a popup blocker only trusts a window.open that
    // happens inside the click's own task, and an intervening await loses that.
    const opened = window.open(signupUrl, '_blank', 'noopener,noreferrer');
    if (!opened) toast.error(t.popupBlocked);

    await copyToClipboard();

    try {
      await profileService.recordHandoff(platform);
    } catch {
      // The learner is already on their way to the job board. Failing to
      // record which one is our problem, not theirs, so it stays silent.
    }
  };

  return (
    <section className="mt-12 pt-10 border-t border-border">
      <h2 className="font-display font-medium text-text-primary text-lg tracking-[-0.02em]">
        {t.heading}
      </h2>
      <p className="text-text-secondary text-sm mt-2 max-w-2xl leading-relaxed">{t.subtitle}</p>

      {/* Said plainly, because the alternative is a learner believing we
          posted their profile somewhere. We copy text and open a tab; every
          account is created by the learner, on the job board's own site. */}
      <p className="text-text-muted text-xs mt-3 max-w-2xl leading-relaxed">{t.manualNotice}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
        {HANDOFF_PLATFORMS.map((platform) => (
          <button
            key={platform.id}
            onClick={() => handleOpen(platform.id, platform.signupUrl)}
            className="group flex items-center justify-between gap-3 px-5 py-4 bg-surface border border-border rounded-lg text-left transition-colors hover:bg-surface-hover hover:border-border-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
          >
            <span className="flex items-center gap-3 min-w-0">
              <span
                aria-hidden="true"
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: platform.accent }}
              />
              <span className="text-text-primary text-sm font-medium truncate">
                {platform.name}
              </span>
            </span>
            <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between gap-4 mb-2">
          <label
            htmlFor="handoff-profile-text"
            className="font-display text-[0.6875rem] uppercase tracking-[0.2em] text-text-muted"
          >
            {t.textLabel}
          </label>
          <button
            onClick={copyToClipboard}
            className="flex-shrink-0 flex items-center gap-1.5 min-h-[44px] sm:min-h-0 px-2 py-2 sm:py-1 -mr-2 sm:mr-0 text-xs text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white rounded"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? t.copied : t.copy}
          </button>
        </div>
        {/* Readable and selectable rather than hidden behind the copy button:
            when the Clipboard API is unavailable this is the fallback, and it
            also lets the learner see exactly what gets pasted. */}
        <textarea
          id="handoff-profile-text"
          readOnly
          value={profileText}
          rows={10}
          className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm text-text-secondary font-mono leading-relaxed resize-y focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
        />
      </div>
    </section>
  );
};

export default PlatformHandoffPanel;
