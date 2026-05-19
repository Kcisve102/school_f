import React, { useState } from 'react';
import { Trash2, Eye, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Video } from '../../types';
import { videoService } from '../../services/video.service';
import { formatDate, formatDuration } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

interface VideoListProps {
  videos: Video[];
  onVideoDeleted?: () => void;
  onVideoEdit?: (video: Video) => void;
}

export const VideoList: React.FC<VideoListProps> = ({ videos, onVideoDeleted, onVideoEdit }) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language].admin;

  const handleDelete = async (videoId: number, title: string) => {
    if (!confirm(`${t.deleteConfirm} "${title}"?`)) {
      return;
    }

    setDeletingId(videoId);

    try {
      await videoService.deleteVideo(videoId);
      toast.success(t.videoDeleted);

      if (onVideoDeleted) {
        onVideoDeleted();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || t.failedToDelete);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusColors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
        {status}
      </span>
    );
  };

  if (videos.length === 0) {
    return (
      <div className="bg-surface rounded-xl p-8 border border-border text-center">
        <p className="text-text-secondary">{t.noVideosUploaded}</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                {t.tableTitle}
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                {t.tableCategory}
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                {t.tableDuration}
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                {t.tableTranscription}
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                {t.tableSummary}
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                {t.tableUploaded}
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                {t.tableActions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {videos.map((video) => (
              <tr key={video.id} className="hover:bg-surface-secondary transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-text-primary max-w-xs truncate">
                    {video.title}
                  </div>
                  {video.description && (
                    <div className="text-sm text-text-secondary max-w-xs truncate">
                      {video.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {video.category ? getStatusBadge(video.category) : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  {video.duration ? formatDuration(video.duration) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(video.transcription_status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(video.summary_status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  {formatDate(video.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => navigate(`/video/${video.id}`)}
                      className="p-2 rounded-lg bg-surface-secondary hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-all"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onVideoEdit?.(video)}
                      className="p-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent transition-all"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(video.id, video.title)}
                      disabled={deletingId === video.id}
                      className="p-2 rounded-lg bg-error/10 hover:bg-error/20 text-error transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VideoList;
