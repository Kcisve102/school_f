import React, { useState } from 'react';
import { Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Video } from '../../types';
import { videoService } from '../../services/video.service';
import { formatDate, formatDuration } from '../../utils/helpers';
import Button from '../common/Button';
import toast from 'react-hot-toast';

interface VideoListProps {
  videos: Video[];
  onVideoDeleted?: () => void;
}

export const VideoList: React.FC<VideoListProps> = ({ videos, onVideoDeleted }) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleDelete = async (videoId: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    setDeletingId(videoId);

    try {
      await videoService.deleteVideo(videoId);
      toast.success('Video deleted successfully');

      if (onVideoDeleted) {
        onVideoDeleted();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete video');
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
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 text-center">
        <p className="text-gray-400">No videos uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Transcription
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Summary
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Uploaded
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {videos.map((video) => (
              <tr key={video.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-white max-w-xs truncate">
                    {video.title}
                  </div>
                  {video.description && (
                    <div className="text-sm text-gray-400 max-w-xs truncate">
                      {video.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {video.duration ? formatDuration(video.duration) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(video.transcription_status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(video.summary_status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {formatDate(video.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => navigate(`/video/${video.id}`)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(video.id, video.title)}
                      disabled={deletingId === video.id}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
