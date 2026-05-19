import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Video } from '../../types';
import { formatDuration, formatDate } from '../../utils/helpers';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

interface VideoCardProps {
  video: Video;
  compact?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, compact }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language].videoCard;

  const getStatusBadge = () => {
    if (video.transcription_status === 'completed' && video.summary_status === 'completed') {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-success bg-success/10 rounded-full border border-success/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          {t.ready}
        </span>
      );
    }

    if (
      video.transcription_status === 'processing' ||
      video.summary_status === 'processing'
    ) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-info bg-info/10 rounded-full border border-info/20">
          {t.processing}
        </span>
      );
    }

    if (
      video.transcription_status === 'failed' ||
      video.summary_status === 'failed'
    ) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-error bg-error/10 rounded-full border border-error/20">
          <AlertCircle className="w-3 h-3 mr-1" />
          {t.failed}
        </span>
      );
    }

    return null;
  };

  return (
    <div
      onClick={() => navigate(`/video/${video.id}`)}
      className={`h-full flex flex-col bg-surface rounded-xl border border-border cursor-pointer hover:bg-surface-secondary hover:border-accent/30 transition-all duration-300 hover:shadow-lg ${compact ? 'p-2 md:p-5' : 'p-5'}`}
    >
      <div className={`relative bg-surface-secondary rounded-lg aspect-video flex items-center justify-center overflow-hidden group ${compact ? 'mb-2 md:mb-4' : 'mb-4'}`}>
        {/* Video thumbnail - shows first frame */}
        <video
          src={video.s3_url}
          preload="metadata"
          className="w-full h-full object-cover"
          muted
          playsInline
          onError={(e) => {
            const target = e.target as HTMLVideoElement;
            target.style.display = 'none';
          }}
        />

        {/* Fallback gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-info/10 pointer-events-none"></div>

        {/* Play icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
          <Play className={`text-white opacity-90 group-hover:scale-110 transition-transform ${compact ? 'w-7 h-7 md:w-12 md:h-12' : 'w-12 h-12'}`} />
        </div>

        {video.duration && (
          <span className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded z-10">
            {formatDuration(video.duration)}
          </span>
        )}
      </div>

      <div className={`flex items-start justify-between ${compact ? 'md:mb-2' : 'mb-2'}`}>
        <h3 className={`font-semibold text-text-primary line-clamp-1 flex-1 ${compact ? 'text-xs md:text-base' : ''}`}>
          {video.title}
        </h3>
        {compact ? <span className="hidden md:inline">{getStatusBadge()}</span> : getStatusBadge()}
      </div>

      {video.description && (
        <p className={`text-sm text-text-secondary line-clamp-1 mb-3 ${compact ? 'hidden md:block' : ''}`}>
          {video.description}
        </p>
      )}

      <div className={`flex items-center text-xs text-text-muted mt-2 ${compact ? 'hidden md:flex' : ''}`}>
        <Clock className="w-3 h-3 mr-1" />
        {formatDate(video.created_at)}
      </div>
    </div>
  );
};

export default VideoCard;
