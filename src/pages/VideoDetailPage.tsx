import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, Transcription, Summary } from '../types';
import { videoService } from '../services/video.service';
import historyService from '../services/history.service';
import wsService from '../services/websocket.service';
import { useScrollReveal } from '../hooks/useScrollReveal';
import VideoPlayer, { VideoPlayerHandle } from '../components/video/VideoPlayer';
import TranscriptDisplay from '../components/video/TranscriptDisplay';
import SummaryPanel from '../components/video/SummaryPanel';
import LessonChatPanel from '../components/video/LessonChatPanel';
import Loader from '../components/common/Loader';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

/** How often playback position is written back to the server. */
const SAVE_INTERVAL_MS = 10000;

export const VideoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Video | null>(null);
  const [transcription, setTranscription] = useState<Transcription | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [refreshingUrl, setRefreshingUrl] = useState(false);
  // Position to seek back to once the player is ready. Serves both the resume
  // point loaded from the server and the position captured before a presigned
  // URL refresh; consumed once on ready.
  const resumeAtRef = useRef<number | null>(null);
  const playerRef = useRef<VideoPlayerHandle>(null);
  // Latest playback position, kept in a ref so the save timer can read it
  // without re-subscribing every second as `currentTime` changes.
  const positionRef = useRef(0);
  const savedPositionRef = useRef(0);
  const completedRef = useRef(false);
  const { language } = useLanguage();
  const t = translations[language].videoDetail;

  useScrollReveal(undefined, [loading]);

  useEffect(() => {
    const fetchVideoData = async () => {
      if (!id) return;

      try {
        const videoData = await videoService.getById(parseInt(id));
        setVideo(videoData);

        if (videoData.transcription_status === 'completed') {
          try {
            const transcriptData = await videoService.getTranscript(parseInt(id));
            setTranscription(transcriptData);
          } catch (err) {
            console.error('Failed to fetch transcript:', err);
          }
        }

        if (videoData.summary_status === 'completed') {
          try {
            const summaryData = await videoService.getSummary(parseInt(id));
            setSummary(summaryData);
          } catch (err) {
            console.error('Failed to fetch summary:', err);
          }
        }

        // Pick up where they left off. A finished video restarts from the
        // beginning rather than dropping them back on the closing frame.
        try {
          const progress = await historyService.getWatchProgress(parseInt(id));
          completedRef.current = progress.completed;
          if (!progress.completed && progress.positionSeconds > 0) {
            resumeAtRef.current = progress.positionSeconds;
            savedPositionRef.current = progress.positionSeconds;
          }
        } catch (err) {
          console.error('Failed to fetch watch progress:', err);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    fetchVideoData();
  }, [id]);

  /**
   * The server already broadcasts processing events, but until now only the
   * admin upload form listened — so a learner who opened a still-processing
   * video sat on "in progress" until they manually refreshed. Subscribe while
   * anything is pending and fold the results in as they land.
   *
   * Events are global broadcasts, so every handler must filter by videoId.
   * (`video:compression:progress` carries no videoId and so can't be attributed
   * to a video; it is deliberately ignored here.)
   */
  useEffect(() => {
    if (!id || !video) return;

    const videoIdNum = parseInt(id);
    // `pending` counts as in-flight, not idle. Summarization only starts once
    // transcription finishes, so unsubscribing the moment the transcript lands
    // would miss the summary events that follow.
    const inFlight = (status: string) =>
      status === 'processing' || status === 'pending';
    if (
      !inFlight(video.transcription_status) &&
      !inFlight(video.summary_status)
    ) {
      return;
    }

    const socket = wsService.connect();
    const isThisVideo = (payload: { videoId?: number }) =>
      payload?.videoId === videoIdNum;

    const onTranscriptionComplete = async (payload: { videoId: number }) => {
      if (!isThisVideo(payload)) return;
      setVideo((prev) =>
        prev ? { ...prev, transcription_status: 'completed' } : prev
      );
      try {
        setTranscription(await videoService.getTranscript(videoIdNum));
      } catch (err) {
        console.error('Failed to fetch transcript after completion:', err);
      }
    };

    const onTranscriptionFailed = (payload: { videoId: number }) => {
      if (!isThisVideo(payload)) return;
      setVideo((prev) =>
        prev ? { ...prev, transcription_status: 'failed' } : prev
      );
    };

    const onSummaryComplete = async (payload: { videoId: number }) => {
      if (!isThisVideo(payload)) return;
      setVideo((prev) => (prev ? { ...prev, summary_status: 'completed' } : prev));
      try {
        setSummary(await videoService.getSummary(videoIdNum));
      } catch (err) {
        console.error('Failed to fetch summary after completion:', err);
      }
    };

    const onSummaryFailed = (payload: { videoId: number }) => {
      if (!isThisVideo(payload)) return;
      setVideo((prev) => (prev ? { ...prev, summary_status: 'failed' } : prev));
    };

    const onSummaryProgress = (payload: { videoId: number }) => {
      if (!isThisVideo(payload)) return;
      // Return the same object when nothing changed so React can bail out —
      // otherwise this effect (which depends on the status) resubscribes on
      // every progress tick.
      setVideo((prev) =>
        prev && prev.summary_status !== 'processing'
          ? { ...prev, summary_status: 'processing' }
          : prev
      );
    };

    socket.on('video:transcription:complete', onTranscriptionComplete);
    socket.on('video:transcription:failed', onTranscriptionFailed);
    socket.on('video:summary:progress', onSummaryProgress);
    socket.on('video:summary:complete', onSummaryComplete);
    socket.on('video:summary:failed', onSummaryFailed);

    return () => {
      socket.off('video:transcription:complete', onTranscriptionComplete);
      socket.off('video:transcription:failed', onTranscriptionFailed);
      socket.off('video:summary:progress', onSummaryProgress);
      socket.off('video:summary:complete', onSummaryComplete);
      socket.off('video:summary:failed', onSummaryFailed);
    };
  }, [id, video?.transcription_status, video?.summary_status]);

  /**
   * Persist playback position periodically and on unmount, so a learner who
   * leaves partway through can resume. Previously nothing was recorded until
   * the video fired `onEnded`, so leaving at 95% left no trace at all.
   */
  useEffect(() => {
    if (!id) return;

    const videoIdNum = parseInt(id);

    const save = () => {
      const position = Math.floor(positionRef.current);
      // Only write when the position has actually moved on; avoids a steady
      // drip of no-op requests while the video is paused.
      if (position <= 0 || position === savedPositionRef.current) return;
      savedPositionRef.current = position;
      historyService
        .recordWatch(videoIdNum, position, completedRef.current)
        .catch((err) => console.error('Failed to save watch position:', err));
    };

    const interval = window.setInterval(save, SAVE_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
      save();
    };
  }, [id]);

  /**
   * Playback URLs are presigned and eventually expire, at which point S3
   * returns 403 and the player errors out. Re-fetch the video to get a fresh
   * signature and resume from where the user was, rather than making them
   * reload the page.
   */
  const handlePlaybackError = async () => {
    if (!id || refreshingUrl) return;

    try {
      setRefreshingUrl(true);
      const resumeAt = positionRef.current;
      const videoData = await videoService.getById(parseInt(id));
      setVideo(videoData);
      resumeAtRef.current = resumeAt;
    } catch (err) {
      console.error('Failed to refresh video URL:', err);
      setError(t.playbackFailed);
    } finally {
      setRefreshingUrl(false);
    }
  };

  const handlePlayerReady = () => {
    if (resumeAtRef.current !== null) {
      playerRef.current?.seekTo(resumeAtRef.current);
      resumeAtRef.current = null;
    }
  };

  // Drives both the transcript segments and the summary's chapter markers.
  const handleSeek = (seconds: number) => {
    playerRef.current?.seekTo(seconds);
  };

  const handleProgress = (playedSeconds: number) => {
    setCurrentTime(playedSeconds);
    positionRef.current = playedSeconds;
  };

  const handleVideoEnded = () => {
    if (video) {
      completedRef.current = true;
      // Record the full duration rather than the last progress tick, which can
      // land a second or two short of the end.
      const endPosition = video.duration ?? Math.floor(positionRef.current);
      savedPositionRef.current = endPosition;
      historyService.recordWatch(video.id, endPosition, true).catch((err) => {
        console.error('Failed to record video watch:', err);
      });
    }

    if (video?.transcription_status === 'completed' &&
        video?.summary_status === 'completed') {
      navigate(`/video/${video.id}/quiz`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <Loader text={t.loadingVideo} />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">{t.videoNotFound}</h2>
          <p className="text-text-secondary mb-6">{error || t.videoNotFoundDesc}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-accent hover:bg-accent-dark text-bg-primary rounded-lg font-semibold transition-all"
          >
            {t.backToHome}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/*
        Sticky player + dual rail.

        The player drives everything else on this page — transcript rows, chapter
        buttons and cited timestamps in the lesson chat all call `seekTo`. In the
        previous stacked layout the player scrolled away the moment you started
        reading, so every seek meant scrolling back up. It is now pinned for the
        length of the rails.

        Full-bleed rather than `container mx-auto`: the transcript wants real
        height and the summary wants a reading measure, and a centred 1280px box
        gave neither enough room.
      */}
      <div className="px-6 lg:px-10 xl:px-14 pt-8 pb-6 border-b border-border-subtle">
        <button
          onClick={() => navigate('/')}
          className="group inline-flex items-center gap-3 min-h-[44px] py-2 font-display text-[0.6875rem] uppercase tracking-[0.2em] text-text-muted hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
          {t.backToVideos}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-end">
          <div className="lg:col-span-8">
            <p className="font-display text-[0.625rem] uppercase tracking-[0.3em] text-text-muted mb-4">
              {t.uploadedOn} {formatDate(video.created_at)}
            </p>
            <h1 className="font-display font-medium text-text-primary text-[clamp(1.5rem,3.2vw,2.5rem)] leading-[1.05] tracking-[-0.03em]">
              {video.title}
            </h1>
            {video.description && (
              <p className="text-text-secondary leading-relaxed max-w-[64ch] mt-4">{video.description}</p>
            )}
          </div>

          {/* Status metadata as a compact row on the masthead rather than a card
              stranded at the bottom of the right rail. */}
          <dl className="lg:col-span-4 grid grid-cols-2 gap-x-6 gap-y-3 lg:justify-items-end">
            {[
              { k: t.uploadType, v: video.upload_type },
              { k: t.compression, v: video.compression_status },
              { k: t.transcription, v: video.transcription_status },
              { k: t.summary, v: video.summary_status },
            ].map((row) => (
              <div key={row.k}>
                <dt className="font-display text-[0.625rem] uppercase tracking-[0.2em] text-text-muted">{row.k}</dt>
                <dd className="font-display text-sm capitalize text-text-primary mt-1">{row.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="px-6 lg:px-10 xl:px-14 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
          {/* Left rail — the player pins here; the transcript scrolls past it. */}
          <div className="lg:col-span-7 xl:col-span-8 lg:sticky lg:top-24 space-y-5">
            <VideoPlayer
              ref={playerRef}
              url={video.s3_url}
              onProgress={handleProgress}
              onEnded={handleVideoEnded}
              onError={handlePlaybackError}
              onReady={handlePlayerReady}
            />

            {video.transcription_status === 'processing' && (
              <div className="flex items-center gap-3 border border-border px-5 py-4 text-info">
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-info" />
                <p className="text-sm">{t.transcriptionInProgress}</p>
              </div>
            )}

            {video.transcription_status === 'failed' && (
              <div className="flex items-center gap-3 border border-error/30 bg-error/10 px-5 py-4 text-error">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm">{t.transcriptionFailed}</p>
              </div>
            )}

            {video.summary_status === 'processing' && (
              <div className="flex items-center gap-3 border border-border px-5 py-4 text-info">
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-info" />
                <p className="text-sm">{t.summarizationInProgress}</p>
              </div>
            )}

            {video.summary_status === 'failed' && (
              <div className="flex items-center gap-3 border border-error/30 bg-error/10 px-5 py-4 text-error">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm">{t.summarizationFailed}</p>
              </div>
            )}
          </div>

          {/* Right rail — everything that is read while the video plays. */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-8">
            {summary && (
              <SummaryPanel
                summaryText={summary.summary_text}
                keyPoints={summary.key_points}
                sections={summary.sections}
                durationSeconds={video.duration}
                onSeek={handleSeek}
              />
            )}

            {transcription && transcription.segments && transcription.segments.length > 0 && (
              <TranscriptDisplay
                segments={transcription.segments}
                currentTime={currentTime}
                onSeek={handleSeek}
              />
            )}

            {/* Grounded in the transcript, so only offered once there is one. */}
            {video.transcription_status === 'completed' && (
              <LessonChatPanel videoId={video.id} onSeek={handleSeek} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetailPage;
