import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, Transcription, Summary } from '../types';
import { videoService } from '../services/video.service';
import historyService from '../services/history.service';
import { useScrollReveal } from '../hooks/useScrollReveal';
import VideoPlayer from '../components/video/VideoPlayer';
import TranscriptDisplay from '../components/video/TranscriptDisplay';
import SummaryPanel from '../components/video/SummaryPanel';
import Loader from '../components/common/Loader';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

export const VideoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Video | null>(null);
  const [transcription, setTranscription] = useState<Transcription | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
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
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    fetchVideoData();
  }, [id]);

  const handleVideoEnded = () => {
    if (video) {
      historyService.recordWatch(video.id).catch((err) => {
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
          <h1 className="text-3xl font-bold text-text-primary mb-2">{video.title}</h1>
          {video.description && (
            <p className="text-text-secondary mb-4">{video.description}</p>
          )}
          <p className="text-sm text-text-muted">{t.uploadedOn} {formatDate(video.created_at)}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6 reveal-up delay-1">
            <VideoPlayer
              url={video.s3_url}
              onProgress={setCurrentTime}
              onEnded={handleVideoEnded}
            />

            {transcription && transcription.segments && transcription.segments.length > 0 && (
              <TranscriptDisplay
                segments={transcription.segments}
                currentTime={currentTime}
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
              />
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
