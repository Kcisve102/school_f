import React from 'react';
import { TranscriptSegment } from '../../types';
import { formatDuration } from '../../utils/helpers';

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
  const handleSegmentClick = (startTime: number) => {
    if (onSeek) {
      onSeek(startTime);
    }
  };

  /*
    No panel chrome or heading — this renders inside a labelled tab.

    Segments were individually filled rounded blocks, which turned a 200-row
    transcript into 200 stacked cards. They are now rows on the page surface,
    separated by hairlines, with only the active row filled. Two columns on wide
    screens, because a transcript line is short and one column left most of the
    width empty.
  */
  return (
    <div className="max-h-[65vh] overflow-y-auto scrollbar-thin border-t border-border-subtle">
      <div className="grid grid-cols-1 xl:grid-cols-2 xl:gap-x-12">
        {segments.map((segment) => {
          const isActive =
            currentTime >= segment.start && currentTime < segment.end;

          return (
            <div
              key={segment.id}
              className={`group grid grid-cols-[3.25rem_1fr] items-baseline gap-3 py-3 pr-3 border-b border-border-subtle transition-colors ${
                isActive ? 'bg-surface-hover' : 'hover:bg-surface/50'
              } ${onSeek ? 'cursor-pointer' : ''}`}
              onClick={() => handleSegmentClick(segment.start)}
            >
              <span
                className={`font-display text-xs tabular-nums transition-colors ${
                  isActive ? 'text-text-primary' : 'text-text-muted group-hover:text-text-secondary'
                }`}
              >
                {formatDuration(segment.start)}
              </span>
              <p
                className={`text-sm leading-relaxed transition-colors ${
                  isActive ? 'text-text-primary' : 'text-text-secondary'
                }`}
              >
                {segment.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TranscriptDisplay;
