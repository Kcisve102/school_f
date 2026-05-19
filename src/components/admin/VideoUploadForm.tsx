import React, { useState } from 'react';
import { videoService } from '../../services/video.service';
import toast from 'react-hot-toast';
import { CATEGORIES } from '../../constants/categories';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';

interface VideoUploadFormProps {
  onSuccess?: () => void;
}

export const VideoUploadForm: React.FC<VideoUploadFormProps> = ({ onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [category, setCategory] = useState<string>('');
  const { language } = useLanguage();
  const t = translations[language].admin;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error(t.pleaseSelectFile);
      return;
    }

    if (!title.trim()) {
      toast.error(t.pleaseEnterTitle);
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', title);
      if (description) {
        formData.append('description', description);
      }
      if (category) {
        formData.append('category', category);
      }

      await videoService.uploadVideo(formData);

      toast.success(t.uploadStarted);

      setTitle('');
      setDescription('');
      setFile(null);
      setUploadProgress(0);
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
            {t.videoFile}
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-text-secondary
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-accent file:text-white
              hover:file:bg-accent-dark
              cursor-pointer"
            required
          />
          {file && (
            <p className="mt-2 text-sm text-text-muted">
              {t.selected}: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div>
            <div className="w-full bg-surface-secondary rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-text-muted mt-1">{uploadProgress}% {t.uploaded}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t.uploading : t.uploadVideo}
        </button>
      </form>
    </div>
  );
};

export default VideoUploadForm;
