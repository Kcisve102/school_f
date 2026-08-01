import React from 'react';
import { FileText, List } from 'lucide-react';
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

  return (
    <div className="bg-surface rounded-xl p-6 border border-border">
      <div className="flex items-center mb-4">
        <FileText className="w-4 h-4 text-text-muted mr-2" />
        <h3 className="font-display font-medium text-text-primary text-base tracking-[-0.02em]">{t.heading}</h3>
      </div>

      <div className="mb-6">
        <p className="text-text-secondary leading-relaxed">{summaryText}</p>
      </div>

      {visibleSections.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <List className="w-4 h-4 text-accent mr-2" />
            <h4 className="font-medium text-text-primary">{t.chapters}</h4>
          </div>
          <ul className="space-y-1">
            {visibleSections.map((section) => (
              <li key={section.start}>
                <button
                  type="button"
                  onClick={() => onSeek?.(section.start)}
                  disabled={!onSeek}
                  className={`w-full flex items-start gap-3 text-left px-2 py-1.5 rounded-lg transition-colors ${
                    onSeek
                      ? 'hover:bg-surface-hover cursor-pointer'
                      : 'cursor-default'
                  }`}
                >
                  <span className="text-xs font-medium text-accent mt-0.5 tabular-nums flex-shrink-0">
                    {formatDuration(section.start)}
                  </span>
                  <span className="text-sm text-text-secondary">
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
          <h4 className="font-medium text-text-primary mb-3">{t.keyPoints}</h4>
          <ul className="space-y-2">
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
  );
};

export default SummaryPanel;
