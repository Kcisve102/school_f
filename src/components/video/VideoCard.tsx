import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Video } from '../../types';
import { formatDuration, formatDate } from '../../utils/helpers';

interface VideoCardProps {
  video: Video;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const navigate = useNavigate();

  const getStatusBadge = () => {
    if (video.transcription_status === 'completed' && video.summary_status === 'completed') {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
          <CheckCircle className="w-3 h-3 mr-1" />
          Ready
        </span>
      );
    }

    if (
      video.transcription_status === 'processing' ||
      video.summary_status === 'processing'
    ) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
          Processing
        </span>
      );
    }

    if (
      video.transcription_status === 'failed' ||
      video.summary_status === 'failed'
    ) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
          <AlertCircle className="w-3 h-3 mr-1" />
          Failed
        </span>
      );
    }

    return null;
  };

  return (
    <div
      onClick={() => navigate(`/video/${video.id}`)}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 cursor-pointer hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl"
    >
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg mb-4 aspect-video flex items-center justify-center overflow-hidden group">
        {/* Video thumbnail - shows first frame */}
        <video
          src={video.s3_url}
          preload="metadata"
          className="w-full h-full object-cover"
          muted
          playsInline
          onError={(e) => {
            // Fallback to gradient background if video fails to load
            const target = e.target as HTMLVideoElement;
            target.style.display = 'none';
          }}
        />

        {/* Fallback gradient overlay (shown if video fails to load) */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 pointer-events-none"></div>

        {/* Play icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
          <Play className="w-12 h-12 text-white opacity-90 group-hover:scale-110 transition-transform" />
        </div>

        {video.duration && (
          <span className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded z-10">
            {formatDuration(video.duration)}
          </span>
        )}
      </div>

      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-white line-clamp-2 flex-1">
          {video.title}
        </h3>
        {getStatusBadge()}
      </div>

      {video.description && (
        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
          {video.description}
        </p>
      )}

      <div className="flex items-center text-xs text-gray-500">
        <Clock className="w-3 h-3 mr-1" />
        {formatDate(video.created_at)}
      </div>
    </div>
  );
};

export default VideoCard;
