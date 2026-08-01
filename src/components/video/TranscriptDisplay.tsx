import React from 'react';
import { TranscriptSegment } from '../../types';
import { formatDuration } from '../../utils/helpers';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

interface TranscriptDisplayProps {
  segments: TranscriptSegment[];
  currentTime?: number;
  onSeek?: (time: number) => void;
}

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  segments,
  currentTime = 0,
  onSeek,
}) => {
  const { language } = useLanguage();
  const t = translations[language].transcript;

  const handleSegmentClick = (startTime: number) => {
    if (onSeek) {
      onSeek(startTime);
    }
  };

  return (
    // A 200-segment transcript was previously capped at 384px, so it read as a
    // small scrolling box regardless of how much room the page had. It now takes
    // viewport-relative height and its heading stays put while the body scrolls.
    <div className="border border-border flex flex-col max-h-[70vh]">
      <h3 className="font-display text-[0.6875rem] uppercase tracking-[0.3em] text-text-muted px-5 py-4 border-b border-border-subtle flex-shrink-0">
        {t.heading}
      </h3>
      <div className="space-y-3 overflow-y-auto scrollbar-thin px-5 py-4">
        {segments.map((segment) => {
          const isActive =
            currentTime >= segment.start && currentTime < segment.end;

          return (
            <div
              key={segment.id}
              className={`p-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-accent/20 border-l-4 border-accent'
                  : 'bg-surface-secondary hover:bg-surface-hover'
              } ${onSeek ? 'cursor-pointer' : ''}`}
              onClick={() => handleSegmentClick(segment.start)}
            >
              <div className="flex items-start">
                <span className="text-xs font-medium text-text-muted mr-3 mt-1">
                  {formatDuration(segment.start)}
                </span>
                <p className="text-sm text-text-secondary flex-1">{segment.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TranscriptDisplay;
