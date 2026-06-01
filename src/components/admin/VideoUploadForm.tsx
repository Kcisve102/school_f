import React, { useState, useEffect, useRef } from 'react';
import { videoService } from '../../services/video.service';
import wsService from '../../services/websocket.service';
import toast from 'react-hot-toast';
import { CATEGORIES } from '../../constants/categories';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

type ProcessingStatus = 'uploading' | 'compressing' | 'transcribing' | 'summarizing' | 'done' | 'failed';

const STEPS: { key: ProcessingStatus; labelEn: string; labelZh: string }[] = [
  { key: 'compressing',  labelEn: 'Compressing video',  labelZh: '正在压缩视频' },
  { key: 'transcribing', labelEn: 'Transcribing audio',  labelZh: '正在转录音频' },
  { key: 'summarizing',  labelEn: 'Generating summary',  labelZh: '正在生成摘要' },
];

const stepOrder: ProcessingStatus[] = ['compressing', 'transcribing', 'summarizing', 'done'];

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
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [failedError, setFailedError] = useState<string>('');
  const { language } = useLanguage();
  const t = translations[language].admin;
  const videoIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!processingStatus) return;
    if (processingStatus === 'done' || processingStatus === 'failed') return;

    const socket = wsService.connect();

    const onCompressionProgress = () => setProcessingStatus('compressing');
    const onTranscriptionProgress = () => setProcessingStatus('transcribing');
    const onTranscriptionComplete = () => setProcessingStatus('summarizing');
    const onTranscriptionFailed = ({ error }: { error: string }) => {
      setFailedError(error || 'Transcription failed');
      setProcessingStatus('failed');
    };
    const onSummaryProgress = () => setProcessingStatus('summarizing');
    const onSummaryComplete = () => {
      setProcessingStatus('done');
      if (onSuccess) onSuccess();
    };
    const onSummaryFailed = ({ error }: { error: string }) => {
      setFailedError(error || 'Summarization failed');
      setProcessingStatus('failed');
    };

    socket.on('video:compression:progress', onCompressionProgress);
    socket.on('video:transcription:progress', onTranscriptionProgress);
    socket.on('video:transcription:complete', onTranscriptionComplete);
    socket.on('video:transcription:failed', onTranscriptionFailed);
    socket.on('video:summary:progress', onSummaryProgress);
    socket.on('video:summary:complete', onSummaryComplete);
    socket.on('video:summary:failed', onSummaryFailed);

    return () => {
      socket.off('video:compression:progress', onCompressionProgress);
      socket.off('video:transcription:progress', onTranscriptionProgress);
      socket.off('video:transcription:complete', onTranscriptionComplete);
      socket.off('video:transcription:failed', onTranscriptionFailed);
      socket.off('video:summary:progress', onSummaryProgress);
      socket.off('video:summary:complete', onSummaryComplete);
      socket.off('video:summary:failed', onSummaryFailed);
    };
  }, [processingStatus, onSuccess]);

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
    setProcessingStatus(null);
    setFailedError('');

    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', title);
      if (description) formData.append('description', description);
      if (category) formData.append('category', category);

      const { videoId } = await videoService.uploadVideo(formData, setUploadProgress);
      videoIdRef.current = videoId;

      setUploadProgress(100);
      setTitle('');
      setDescription('');
      setFile(null);
      setCategory('');
      setProcessingStatus('compressing');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Upload failed');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const getStepState = (stepKey: ProcessingStatus): 'done' | 'active' | 'pending' => {
    if (!processingStatus) return 'pending';
    if (processingStatus === 'done') return 'done';
    const currentIdx = stepOrder.indexOf(processingStatus);
    const stepIdx = stepOrder.indexOf(stepKey);
    if (stepIdx < currentIdx) return 'done';
    if (stepIdx === currentIdx) return 'active';
    return 'pending';
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

        {/* File upload progress bar */}
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
          disabled={loading || (processingStatus !== null && processingStatus !== 'done' && processingStatus !== 'failed')}
          className="w-full px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t.uploading : t.uploadVideo}
        </button>
      </form>

      {/* Backend processing status */}
      {processingStatus && (
        <div className="mt-6 p-4 bg-surface-secondary rounded-lg border border-border space-y-3">
          {STEPS.map(({ key, labelEn, labelZh }) => {
            const state = getStepState(key);
            const label = language === 'zh' ? labelZh : labelEn;
            return (
              <div key={key} className="flex items-center gap-3">
                {state === 'done' ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : state === 'active' ? (
                  <Loader2 className="w-5 h-5 text-accent flex-shrink-0 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-border flex-shrink-0" />
                )}
                <span className={
                  state === 'done' ? 'text-sm text-green-500' :
                  state === 'active' ? 'text-sm text-text-primary font-medium' :
                  'text-sm text-text-muted'
                }>
                  {label}
                </span>
              </div>
            );
          })}

          {processingStatus === 'done' && (
            <div className="flex items-center gap-3 pt-1 border-t border-border">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm font-semibold text-green-500">
                {language === 'zh' ? '视频已就绪！' : 'Video is ready!'}
              </span>
            </div>
          )}

          {processingStatus === 'failed' && (
            <div className="flex items-center gap-3 pt-1 border-t border-border">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-500">
                {language === 'zh' ? `处理失败：${failedError}` : `Failed: ${failedError}`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoUploadForm;
