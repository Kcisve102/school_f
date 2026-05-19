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

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 max-h-96 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 text-white">Transcript</h3>
      <div className="space-y-3">
        {segments.map((segment) => {
          const isActive =
            currentTime >= segment.start && currentTime < segment.end;

          return (
            <div
              key={segment.id}
              className={`p-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-purple-500/20 border-l-4 border-purple-500'
                  : 'bg-white/5 hover:bg-white/10'
              } ${onSeek ? 'cursor-pointer' : ''}`}
              onClick={() => handleSegmentClick(segment.start)}
            >
              <div className="flex items-start">
                <span className="text-xs font-medium text-gray-400 mr-3 mt-1">
                  {formatDuration(segment.start)}
                </span>
                <p className="text-sm text-gray-200 flex-1">{segment.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TranscriptDisplay;
