import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { videoService } from '../../services/video.service';
import toast from 'react-hot-toast';
import { Video } from '../../types';
import { CATEGORIES } from '../../constants/categories';

interface VideoEditModalProps {
  video: Video;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const VideoEditModal: React.FC<VideoEditModalProps> = ({
  video,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description || '');
  const [category, setCategory] = useState<string>(video.category || '');
  const [loading, setLoading] = useState(false);

  // Update local state when video prop changes
  useEffect(() => {
    setTitle(video.title);
    setDescription(video.description || '');
    setCategory(video.category || '');
  }, [video]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a video title');
      return;
    }

    setLoading(true);

    try {
      await videoService.updateVideo(video.id, title, description || undefined, category || undefined);

      toast.success('Video updated successfully!');

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-surface rounded-xl border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-text-primary">Edit Video</h2>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter video title"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors resize-none"
              rows={4}
              placeholder="Enter video description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Category (Optional)
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent/50 transition-colors"
            >
              <option value="">No Category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoEditModal;
