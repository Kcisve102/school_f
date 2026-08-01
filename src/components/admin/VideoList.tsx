import React, { useState } from 'react';
import { Trash2, Eye, Edit, RefreshCw } from 'lucide-react';
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
  const [reRenderingId, setReRenderingId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language].admin;

  const handleReRender = async (videoId: number, title: string) => {
    if (!confirm(`${t.reRenderConfirm} "${title}"?`)) {
      return;
    }

    setReRenderingId(videoId);

    try {
      await videoService.reRenderTranscript(videoId);
      toast.success(t.reRenderStarted);

      if (onVideoDeleted) {
        onVideoDeleted();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || t.failedToReRender);
    } finally {
      setReRenderingId(null);
    }
  };

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
      pending: 'bg-warning/20 text-warning border-warning/30',
      processing: 'bg-info/20 text-info border-info/30',
      completed: 'bg-success/20 text-success border-success/30',
      failed: 'bg-error/20 text-error border-error/30',
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full border font-mono uppercase tracking-wide ${statusColors[status] || 'bg-surface-hover text-text-muted border-border'}`}>
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
                      className="p-2 rounded-lg bg-surface-secondary hover:bg-surface-hover text-text-primary transition-all"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleReRender(video.id, video.title)}
                      disabled={reRenderingId === video.id}
                      className="p-2 rounded-lg bg-warning/10 hover:bg-warning/20 text-warning transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title={t.reRender}
                    >
                      <RefreshCw className={`w-4 h-4 ${reRenderingId === video.id ? 'animate-spin' : ''}`} />
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
