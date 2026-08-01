import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload as UploadIcon, Link as LinkIcon } from 'lucide-react';
import VideoUploadForm from '../components/admin/VideoUploadForm';
import VideoLinkForm from '../components/admin/VideoLinkForm';

/**
 * Upload was previously a panel wedged into the admin page above the video
 * table, competing with it for width. It is a distinct task with its own
 * multi-step processing feedback, so it gets its own route and its own canvas:
 * a narrow form column against open space, with the source choice promoted from
 * a tab strip to two explicit options.
 */
export const UploadPage: React.FC = () => {
  const [source, setSource] = useState<'upload' | 'link'>('upload');
  const navigate = useNavigate();

  const sources = [
    {
      key: 'upload' as const,
      icon: UploadIcon,
      label: 'From file',
      hint: 'Upload a video from this device',
    },
    {
      key: 'link' as const,
      icon: LinkIcon,
      label: 'From URL',
      hint: 'Import from a link',
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="px-6 lg:px-12 xl:px-20 pt-8 pb-6 border-b border-border-subtle">
        <button
          onClick={() => navigate('/admin')}
          className="group inline-flex items-center gap-3 min-h-[44px] py-2 font-display text-[0.6875rem] uppercase tracking-[0.2em] text-text-muted hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
          Back to admin
        </button>

        <p className="font-display text-[0.6875rem] uppercase tracking-[0.3em] text-text-muted mb-5">
          Add to the library
        </p>
        <h1 className="font-display font-medium text-text-primary text-[clamp(1.75rem,5vw,4rem)] leading-[1] tracking-[-0.04em]">
          Upload
        </h1>
      </div>

      <div className="px-6 lg:px-12 xl:px-20 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start">
          {/* Source choice as a numbered list, not a tab strip — there are only
              two, and each deserves a line of explanation. */}
          <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24">
            <p className="font-display text-[0.6875rem] uppercase tracking-[0.3em] text-text-muted mb-5">
              Source
            </p>
            <div className="border-t border-border-subtle">
              {sources.map((s, i) => {
                const active = source === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => setSource(s.key)}
                    className={`group w-full text-left grid grid-cols-[2rem_1fr] gap-x-4 items-baseline border-b border-border-subtle py-5 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white ${
                      active ? 'bg-surface/60' : 'hover:bg-surface/30'
                    }`}
                  >
                    <span
                      className={`font-display text-xs tabular-nums ${
                        active ? 'text-text-primary' : 'text-text-muted'
                      }`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>
                      <span
                        className={`flex items-center gap-2 font-display text-sm tracking-[-0.01em] ${
                          active ? 'text-text-primary' : 'text-text-secondary'
                        }`}
                      >
                        <s.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                        {s.label}
                      </span>
                      <span className="block text-xs text-text-muted mt-1">{s.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* The form itself keeps a comfortable measure rather than stretching
              across the full width — long input rows are harder to scan. */}
          <div className="lg:col-span-8 xl:col-span-6">
            {source === 'upload' ? (
              <VideoUploadForm onSuccess={() => navigate('/admin')} />
            ) : (
              <VideoLinkForm onSuccess={() => navigate('/admin')} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
