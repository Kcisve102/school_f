import React, { useState } from 'react';
import { Link2 } from 'lucide-react';
import { videoService } from '../../services/video.service';
import Input from '../common/Input';
import Button from '../common/Button';
import toast from 'react-hot-toast';

interface VideoLinkFormProps {
  onSuccess?: () => void;
}

export const VideoLinkForm: React.FC<VideoLinkFormProps> = ({ onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim() || !title.trim()) {
      toast.error('Please enter both title and URL');
      return;
    }

    setLoading(true);

    try {
      await videoService.uploadVideoLink(url, title, description);

      toast.success('Video download started! Processing will continue in the background.');

      setTitle('');
      setDescription('');
      setUrl('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Link2 className="w-5 h-5 mr-2" />
        Upload from URL
      </h3>

      <form onSubmit={handleSubmit}>
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Enter video title"
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input resize-none"
            rows={3}
            placeholder="Enter video description"
          />
        </div>

        <Input
          label="Video URL"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          placeholder="https://example.com/video.mp4"
        />

        <Button type="submit" variant="primary" loading={loading} className="w-full">
          Download & Upload
        </Button>
      </form>
    </div>
  );
};

export default VideoLinkForm;
