import React from 'react';
import { PlayCircle, SearchX } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

interface HistoryEmptyStateProps {
  /** `empty` = nothing watched at all; `no-matches` = the filter/search excluded everything. */
  variant: 'empty' | 'no-matches';
}

/**
 * Left-aligned and measure-capped rather than centered in a bordered panel — a
 * centered box announces the absence, while a paragraph at the same left edge as
 * the rest of the page reads as a sentence the page is saying.
 */
export const HistoryEmptyState: React.FC<HistoryEmptyStateProps> = ({ variant }) => {
  const { language } = useLanguage();
  const t = translations[language].history;

  const Icon = variant === 'empty' ? PlayCircle : SearchX;

  return (
    <div className="py-20 max-w-[46ch]">
      <Icon className="w-8 h-8 text-text-muted mb-6" strokeWidth={1.5} />
      <h3 className="font-display font-medium text-text-primary text-xl tracking-[-0.02em] mb-3">
        {variant === 'empty' ? t.empty : t.noMatches}
      </h3>
      <p className="text-text-secondary leading-relaxed">
        {variant === 'empty' ? t.emptyDesc : t.noMatchesDesc}
      </p>
    </div>
  );
};

export default HistoryEmptyState;
