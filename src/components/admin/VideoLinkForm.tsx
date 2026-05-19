import React, { useState } from 'react';
import { videoService } from '../../services/video.service';
import toast from 'react-hot-toast';
import { CATEGORIES } from '../../constants/categories';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

interface VideoLinkFormProps {
  onSuccess?: () => void;
}

export const VideoLinkForm: React.FC<VideoLinkFormProps> = ({ onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<string>('');
  const { language } = useLanguage();
  const t = translations[language].admin;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim() || !title.trim()) {
      toast.error(t.pleaseEnterTitleUrl);
      return;
    }

    setLoading(true);

    try {
      await videoService.uploadVideoLink(url, title, description, category || undefined);

      toast.success(t.downloadStarted);

      setTitle('');
      setDescription('');
      setUrl('');
      setCategory('');

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
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {t.title}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder={t.enterVideoTitle}
            className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {t.descriptionOptional}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors resize-none"
            rows={3}
            placeholder={t.enterVideoDesc}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {t.categoryOptional}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent/50 transition-colors"
          >
            <option value="">{t.noCategory}</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {t.videoUrl}
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            placeholder="https://example.com/video.mp4"
            className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t.uploading : t.downloadUpload}
        </button>
      </form>
    </div>
  );
};

export default VideoLinkForm;
