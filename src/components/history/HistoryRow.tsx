import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Briefcase } from 'lucide-react';
import { WatchHistoryItem } from '../../types';
import { formatDate } from '../../utils/helpers';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';
import WatchProgress from './WatchProgress';

interface HistoryRowProps {
  item: WatchHistoryItem;
}

/**
 * One watched video.
 *
 * The row root is deliberately not a button: it contains a title control and one
 * control per quiz attempt, and nesting those inside an outer button is invalid
 * HTML that breaks keyboard traversal. The thumbnail and the title are the two
 * navigation affordances; everything else is inert text.
 */
export const HistoryRow: React.FC<HistoryRowProps> = ({ item }) => {
  const { video, watchedAt, positionSeconds, completed, attempts } = item;
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language].history;

  const openVideo = () => navigate(`/video/${video.id}`);

  /* The attempt review is its own page, so the title travels with the link —
     the attempt payload has no video title and fetching one for a heading is a
     round trip the page can avoid. */
  const openAttempt = (attemptId: number) =>
    navigate(`/attempt/${attemptId}`, { state: { videoTitle: video.title } });

  return (
    <div className="group grid grid-cols-[7rem_1fr] sm:grid-cols-[12rem_minmax(0,1fr)_auto] gap-5 sm:gap-8 items-start border-b border-border-subtle py-5 transition-colors hover:bg-surface/40">
      <button
        onClick={openVideo}
        aria-label={video.title}
        tabIndex={-1}
        className="relative aspect-video overflow-hidden bg-surface-secondary focus:outline-none"
      >
        {/* Same metadata-seek trick the rest of the library uses: the thumbnail is
            a real frame from the video rather than a separately stored image. */}
        <video
          src={video.s3_url}
          preload="metadata"
          className="w-full h-full object-cover"
          muted
          playsInline
          onLoadedMetadata={(e) => {
            const el = e.target as HTMLVideoElement;
            if (el.duration && isFinite(el.duration)) {
              el.currentTime = Math.min(1, el.duration * 0.1);
            }
          }}
          onError={(e) => {
            const target = e.target as HTMLVideoElement;
            target.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
          <PlayCircle className="w-7 h-7 text-white opacity-80" />
        </div>

        <WatchProgress
          positionSeconds={positionSeconds}
          completed={completed}
          durationSeconds={video.duration}
          variant="bar"
        />
      </button>

      <div className="min-w-0">
        <button
          onClick={openVideo}
          className="block max-w-full truncate font-display text-text-primary tracking-[-0.01em] text-left transition-colors hover:text-text-secondary focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
        >
          {video.title}
        </button>

        {attempts.length === 0 ? (
          <p className="mt-3 font-display text-[0.625rem] uppercase tracking-[0.15em] text-text-muted">
            {t.noQuiz}
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {/* Attempts read as a strip of scores. Each opens its own review page —
                the review is several screens tall and does not belong unfolded
                between two rows, nor squeezed into a rail beside them. */}
            {attempts.map((a) => (
              <button
                key={a.id}
                onClick={() => openAttempt(a.id)}
                className="inline-flex items-center gap-2 border border-border-subtle px-3 py-1.5 font-display text-[0.625rem] uppercase tracking-[0.15em] tabular-nums text-text-muted transition-colors hover:border-border-hover hover:text-text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
              >
                {Math.round(a.percentageScore)}%
                {a.hasJobSuggestions && <Briefcase className="w-3 h-3" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="hidden sm:flex flex-col items-end gap-2 whitespace-nowrap font-display text-[0.625rem] uppercase tracking-[0.15em] text-text-muted">
        <WatchProgress
          positionSeconds={positionSeconds}
          completed={completed}
          durationSeconds={video.duration}
          variant="label"
        />
        {/* `watched_at` is rewritten on every 10s progress save, so this is the
            last time the video was open, not the first. */}
        {watchedAt && <span>{t.watchedOn} {formatDate(watchedAt)}</span>}
      </div>
    </div>
  );
};

export default HistoryRow;
