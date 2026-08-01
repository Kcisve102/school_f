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
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <button
        onClick={() => navigate('/')}
        className="mb-6 flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-hover border border-border rounded-lg text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t.backToVideos}
      </button>

      <div className="space-y-6">
        <div className="reveal-up">
          <p className="font-display text-[0.6875rem] uppercase tracking-[0.3em] text-text-muted mb-4">
            {t.uploadedOn} {formatDate(video.created_at)}
          </p>
          <h1 className="font-display font-medium text-text-primary text-[clamp(1.5rem,3.5vw,2.75rem)] leading-[1.05] tracking-[-0.03em]">
            {video.title}
          </h1>
          {video.description && (
            <p className="text-text-secondary leading-relaxed max-w-[60ch] mt-5">{video.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6 reveal-up delay-1">
            <VideoPlayer
              ref={playerRef}
              url={video.s3_url}
              onProgress={handleProgress}
              onEnded={handleVideoEnded}
              onError={handlePlaybackError}
              onReady={handlePlayerReady}
            />

            {transcription && transcription.segments && transcription.segments.length > 0 && (
              <TranscriptDisplay
                segments={transcription.segments}
                currentTime={currentTime}
                onSeek={handleSeek}
              />
            )}

            {video.transcription_status === 'processing' && (
              <div className="bg-surface rounded-xl p-6 border border-border">
                <div className="flex items-center text-info">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-info mr-3"></div>
                  <p>{t.transcriptionInProgress}</p>
                </div>
              </div>
            )}

            {video.transcription_status === 'failed' && (
              <div className="bg-error/10 rounded-xl p-6 border border-error/30">
                <div className="flex items-center text-error">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <p>{t.transcriptionFailed}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 reveal-up delay-2">
            {summary && (
              <SummaryPanel
                summaryText={summary.summary_text}
                keyPoints={summary.key_points}
                sections={summary.sections}
                durationSeconds={video.duration}
                onSeek={handleSeek}
              />
            )}

            {/* Grounded in the transcript, so only offered once there is one. */}
            {video.transcription_status === 'completed' && (
              <LessonChatPanel videoId={video.id} onSeek={handleSeek} />
            )}

            {video.summary_status === 'processing' && (
              <div className="bg-surface rounded-xl p-6 border border-border">
                <div className="flex items-center text-info">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-info mr-3"></div>
                  <p>{t.summarizationInProgress}</p>
                </div>
              </div>
            )}

            {video.summary_status === 'failed' && (
              <div className="bg-error/10 rounded-xl p-6 border border-error/30">
                <div className="flex items-center text-error">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <p>{t.summarizationFailed}</p>
                </div>
              </div>
            )}

            <div className="bg-surface rounded-xl p-6 border border-border">
              <h3 className="font-semibold mb-3 text-text-primary">{t.videoInformation}</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-text-muted">{t.uploadType}</dt>
                  <dd className="font-medium capitalize text-text-primary">{video.upload_type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">{t.compression}</dt>
                  <dd className="font-medium capitalize text-text-primary">{video.compression_status}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">{t.transcription}</dt>
                  <dd className="font-medium capitalize text-text-primary">{video.transcription_status}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">{t.summary}</dt>
                  <dd className="font-medium capitalize text-text-primary">{video.summary_status}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetailPage;
