import React from 'react';
import { formatDuration } from '../../utils/helpers';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

interface WatchProgressProps {
  positionSeconds: number;
  completed: boolean;
  /** Nullable: ffprobe can fail to read a duration, and there is no repair path. */
  durationSeconds: number | null;
  /** `bar` is the strip on the thumbnail; `label` is the mono meta text. */
  variant: 'bar' | 'label';
}

/**
 * The single place the watch-progress rule lives.
 *
 * `completed` is a latch on the server — the upsert is `completed OR VALUES(completed)`
 * while `position_seconds` is last-write-wins. Rewatching a finished video from the
 * start therefore leaves `completed = true` sitting next to a position of a few
 * seconds. Deriving a percentage in that state renders "3%" on a video the learner
 * has already finished, so `completed` wins outright and the ratio is never consulted.
 *
 * Duration is nullable, and a null one makes any ratio meaningless rather than zero —
 * so that case degrades to a bare resume timestamp instead of an empty bar.
 */
export const getWatchState = (
  positionSeconds: number,
  completed: boolean,
  durationSeconds: number | null
): { kind: 'completed' | 'in-progress' | 'unmeasured' | 'not-started'; percent: number } => {
  if (completed) return { kind: 'completed', percent: 100 };
  if (positionSeconds <= 0) return { kind: 'not-started', percent: 0 };
  if (!durationSeconds || durationSeconds <= 0) return { kind: 'unmeasured', percent: 0 };

  // Rows written before the server-side clamp shipped can exceed duration.
  const percent = Math.min(100, Math.round((positionSeconds / durationSeconds) * 100));
  return { kind: 'in-progress', percent };
};

export const WatchProgress: React.FC<WatchProgressProps> = ({
  positionSeconds,
  completed,
  durationSeconds,
  variant,
}) => {
  const { language } = useLanguage();
  const t = translations[language].history;
  const state = getWatchState(positionSeconds, completed, durationSeconds);

  if (variant === 'bar') {
    // Nothing to draw for a video that was never started or can't be measured —
    // an always-present empty track would read as a component, not as information.
    if (state.kind === 'not-started' || state.kind === 'unmeasured') return null;

    return (
      <div
        className="absolute inset-x-0 bottom-0 h-[3px] bg-black/60"
        role="progressbar"
        aria-valuenow={state.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={state.kind === 'completed' ? t.completed : t.resume}
      >
        <div
          className={`h-full transition-[width] duration-200 ${
            state.kind === 'completed' ? 'bg-success' : 'bg-white'
          }`}
          style={{ width: `${state.percent}%` }}
        />
      </div>
    );
  }

  if (state.kind === 'completed') {
    return <span className="text-success">{t.completed}</span>;
  }

  if (state.kind === 'not-started') {
    return <span>{t.notStarted}</span>;
  }

  // Unmeasured keeps the resume point, which is still true and still useful,
  // and simply omits the percentage it cannot compute.
  if (state.kind === 'unmeasured') {
    return (
      <span className="tabular-nums">
        {t.resume} {formatDuration(positionSeconds)}
      </span>
    );
  }

  return (
    <span className="tabular-nums">
      {t.resume} {formatDuration(positionSeconds)} · {state.percent}%
    </span>
  );
};

export default WatchProgress;
