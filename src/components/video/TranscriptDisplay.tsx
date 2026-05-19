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
    <div className="bg-surface rounded-xl p-6 border border-border max-h-96 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 text-text-primary">{t.heading}</h3>
      <div className="space-y-3">
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
