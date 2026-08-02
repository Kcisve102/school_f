import React from 'react';
import { List } from 'lucide-react';
import { SummarySection } from '../../types';
import { formatDuration } from '../../utils/helpers';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

interface SummaryPanelProps {
  summaryText: string;
  keyPoints: string[];
  /** Absent for summaries generated before chapter markers existed. */
  sections?: SummarySection[] | null;
  /** Used to drop markers that fall outside the playable range. */
  durationSeconds?: number | null;
  onSeek?: (seconds: number) => void;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({
  summaryText,
  keyPoints,
  sections,
  durationSeconds,
  onSeek,
}) => {
  const { language } = useLanguage();
  const t = translations[language].summary;

  // Some videos have a transcript running past the stored duration (it is
  // recorded before compression), so a chapter can land beyond the end of the
  // playable file. Seeking there does nothing, so don't offer it.
  const visibleSections = (sections ?? []).filter(
    (section) => !durationSeconds || section.start < durationSeconds
  );

  /*
    No panel chrome and no heading: this renders inside a labelled tab, so a
    border would be a box inside a box and the heading would repeat the tab
    directly above it.

    Chapters and key points sit side by side on wide screens. Stacked, the prose
    and both lists ran as one long column when the page has the width for two.
  */
  return (
    <div className="space-y-10">
      <p className="text-text-secondary leading-relaxed max-w-[80ch]">{summaryText}</p>

      {/* The key-points column is capped at a reading measure rather than 1fr:
          unbounded, it ran the full page width and its lines became unreadably
          long on a wide screen. */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,20rem)_minmax(0,60ch)] gap-10 xl:gap-16 items-start">
        {visibleSections.length > 0 && (
          <div>
            <h4 className="font-display text-[0.6875rem] uppercase tracking-[0.3em] text-text-muted mb-4 pb-3 border-b border-border-subtle flex items-center gap-2">
              <List className="w-3.5 h-3.5" strokeWidth={1.5} />
              {t.chapters}
            </h4>
            <ul>
              {visibleSections.map((section) => (
                <li key={section.start}>
                  <button
                    type="button"
                    onClick={() => onSeek?.(section.start)}
                    disabled={!onSeek}
                    className={`group w-full flex items-baseline gap-4 text-left py-3 min-h-[44px] border-b border-border-subtle transition-colors ${
                      onSeek ? 'hover:bg-surface-hover cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <span className="font-display text-xs text-text-muted tabular-nums flex-shrink-0 transition-colors group-hover:text-text-primary">
                      {formatDuration(section.start)}
                    </span>
                    <span className="text-sm text-text-secondary transition-colors group-hover:text-text-primary">
                      {section.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {keyPoints && keyPoints.length > 0 && (
          <div>
            <h4 className="font-display text-[0.6875rem] uppercase tracking-[0.3em] text-text-muted mb-4 pb-3 border-b border-border-subtle">
              {t.keyPoints}
            </h4>
            <ul className="space-y-3">
              {/* Numbered rather than dotted: the ban list prohibits decorative
                  status dots, and an index is useful here anyway. */}
              {keyPoints.map((point, index) => (
                <li key={index} className="grid grid-cols-[1.75rem_1fr] items-baseline">
                  <span className="font-display text-[0.6875rem] text-text-muted tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-text-secondary leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryPanel;
