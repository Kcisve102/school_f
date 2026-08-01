import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, AlertCircle } from 'lucide-react';
import { Video } from '../../types';
import { formatDuration, formatDate } from '../../utils/helpers';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

interface VideoCardProps {
  video: Video;
  compact?: boolean;
  /** Position in the grid. Renders as a hairline ordinal in the meta row. */
  index?: number;
}

/**
 * The card is not a panel. The thumbnail is the object; the text sits under it
 * on the page surface with no border, fill, or padding box of its own. A grid of
 * bordered, filled rectangles reads as a template regardless of what is inside
 * them, and the thumbnails already supply every edge the layout needs.
 *
 * Status appears only when it is not `ready`. When every item in a library
 * carries the same green pill, the pill has stopped being information and is
 * just noise repeated once per card.
 */
export const VideoCard: React.FC<VideoCardProps> = ({ video, compact, index }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language].videoCard;

  const isProcessing =
    video.transcription_status === 'processing' || video.summary_status === 'processing';
  const isFailed =
    video.transcription_status === 'failed' || video.summary_status === 'failed';

  return (
    <button
      type="button"
      onClick={() => navigate(`/video/${video.id}`)}
      className="group w-full text-left flex flex-col focus:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#16171b]"
    >
      {/* Thumbnail — the only filled surface in the card, and the only thing that
          moves on hover. A 1px lift rather than a scale, so the grid's baseline
          stays legible while a card is being pointed at. */}
      <div className="relative aspect-video w-full overflow-hidden bg-surface-secondary transition-transform duration-300 ease-out group-hover:-translate-y-1">
        {/* Seeked a little past the start once metadata lands. Most of these
            videos open on a fade from black, so frame 0 is an empty rectangle —
            a second in, there is actually something to look at. */}
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
            (e.target as HTMLVideoElement).style.display = 'none';
          }}
        />

        {/* Drawn as an overlay so it sits above the video rather than being
            painted over by object-cover. */}
        <div className="absolute inset-0 border border-border-subtle pointer-events-none transition-colors duration-300 group-hover:border-white/25" />

        {/* Dimmed until hover — twenty simultaneous white triangles competed with
            the thumbnails they were sitting on. */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Play
            className={`text-white ${compact ? 'w-6 h-6 md:w-8 md:h-8' : 'w-8 h-8'}`}
            strokeWidth={1.25}
          />
        </div>

        {video.duration && (
          <span className="absolute bottom-0 right-0 bg-black/80 text-white font-display text-[0.6875rem] tabular-nums tracking-[0.05em] px-2 py-1">
            {formatDuration(video.duration)}
          </span>
        )}

        {/* Non-ready states cover the frame rather than perching on it — an item
            still processing is not yet a watchable item. */}
        {(isProcessing || isFailed) && (
          <div className="absolute inset-0 bg-[#16171b]/75 flex items-end p-3">
            <span
              className={`inline-flex items-center gap-1.5 font-display text-[0.6875rem] uppercase tracking-[0.15em] ${
                isFailed ? 'text-error' : 'text-text-secondary'
              }`}
            >
              {isFailed && <AlertCircle className="w-3 h-3" strokeWidth={1.5} />}
              {isFailed ? t.failed : t.processing}
              {isProcessing && (
                <span className="ml-1 inline-block w-1 h-1 bg-text-secondary animate-pulse" />
              )}
            </span>
          </div>
        )}
      </div>

      {/* Ordinal and date share one hairline row above the title, so the title
          gets a clean left edge with nothing competing beside it. */}
      <div
        className={`flex items-baseline gap-3 border-b border-border-subtle pb-1.5 ${
          compact ? 'mt-2.5 md:mt-4' : 'mt-4'
        }`}
      >
        {typeof index === 'number' && (
          <span className="font-display text-[0.625rem] text-text-muted tabular-nums tracking-[0.1em]">
            {String(index + 1).padStart(2, '0')}
          </span>
        )}
        <span
          className={`font-display text-[0.625rem] uppercase tracking-[0.15em] text-text-muted ml-auto ${
            compact ? 'hidden md:block' : ''
          }`}
        >
          {formatDate(video.created_at)}
        </span>
      </div>

      <h3
        className={`font-display font-medium text-text-primary tracking-[-0.01em] leading-snug line-clamp-2 mt-2.5 transition-colors group-hover:text-white ${
          compact ? 'text-xs md:text-[0.9375rem]' : 'text-[0.9375rem]'
        }`}
      >
        {video.title}
      </h3>
    </button>
  );
};

export default VideoCard;
