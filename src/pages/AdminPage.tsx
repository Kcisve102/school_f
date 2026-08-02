import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '../types';
import { videoService } from '../services/video.service';
import { useAuth } from '../hooks/useAuth';
import VideoList from '../components/admin/VideoList';
import VideoEditModal from '../components/video/VideoEditModal';
import { LayoutDashboard, Upload, BookOpen } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchVideos = async () => {
    try {
      const data = await videoService.getAll();
      setVideos(data);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleEditSuccess = () => fetchVideos();

  const totalVideos = videos.length;
  const processedVideos = videos.filter(v => v.transcription_status === 'completed').length;
  const processingVideos = videos.filter(v => v.transcription_status === 'processing').length;

  /* Bookmarks and Settings are gone rather than restyled — both pointed at '#'.
     A nav item that goes nowhere is worse after a restyle, because it now looks
     as deliberate as the ones that work. */
  const navItems = [
    { icon: LayoutDashboard, label: 'Admin', active: true, path: '/admin' },
    { icon: BookOpen, label: 'Categories', active: false, path: '/categories' },
  ];

  return (
    <div className="min-h-screen bg-page-gradient text-text-primary">
      <main>

        {/*
          The 256px filled rail is gone. It carried an accent-tinted active pill
          and body-weight labels — the only nav in the app still doing either,
          which is what made it read as a different product from the header
          floating directly above it. Two live destinations do not need a
          permanent column, and the width returns to the video table.

          What replaces it is the same tab strip the dashboard and categories
          pages use: hairline rule, mono uppercase, white underline for active.
          One nav grammar across every page.
        */}
        <div className="px-4 md:px-6 lg:px-8 pt-10 sm:pt-16">
          <div className="max-w-[1800px]">
            <p className="font-display text-[0.6875rem] uppercase tracking-[0.3em] text-text-muted mb-6">
              Manage videos and monitor platform statistics
            </p>
            <h1 className="font-display font-medium text-text-primary text-[clamp(1.75rem,4.5vw,3.5rem)] leading-[1] tracking-[-0.03em]">
              Admin
            </h1>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-10 sm:mt-14 border-b border-border-subtle">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`relative inline-flex items-center gap-2.5 pt-2 pb-4 min-h-[44px] font-display text-xs uppercase tracking-[0.15em] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white ${
                    item.active
                      ? 'text-text-primary after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-text-primary'
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {item.label}
                </button>
              ))}
              {user && (
                <span className="ml-auto pb-4 font-display text-[0.6875rem] uppercase tracking-[0.2em] text-text-muted">
                  {user.full_name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 md:px-6 lg:px-8 py-10 sm:py-14">
          <div className="max-w-[1800px]">

            {/* Stats — divided band, matching the dashboard. */}
            <div className="grid grid-cols-3 divide-x divide-border-subtle border-y border-border-subtle mb-12 lg:mb-20">
              {[
                { value: String(totalVideos).padStart(2, '0'), label: 'Total videos' },
                { value: String(processedVideos).padStart(2, '0'), label: 'Processed' },
                { value: String(processingVideos).padStart(2, '0'), label: 'In queue' },
              ].map((s, i) => (
                <div key={s.label} className={`py-6 sm:py-10 px-4 sm:px-8 ${i === 0 ? 'pl-0' : ''}`}>
                  <p className="font-display text-text-primary text-[clamp(1.5rem,4vw,3rem)] leading-none tracking-[-0.03em] tabular-nums">
                    {s.value}
                  </p>
                  <p className="font-display text-[0.6875rem] uppercase tracking-[0.2em] text-text-muted mt-3">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Upload moved to /admin/upload. It is a distinct task with its own
                processing feedback, and it was competing with the table for width
                on a page whose job is managing what already exists. */}
            <div>
              <div className="flex items-end justify-between gap-6 mb-6">
                <h3 className="font-display text-[0.6875rem] uppercase tracking-[0.3em] text-text-muted">
                  Manage videos
                </h3>
                <button
                  onClick={() => navigate('/admin/upload')}
                  className="group inline-flex items-center gap-3 bg-white text-[#16171b] px-6 py-3 font-display text-xs uppercase tracking-[0.15em] transition-colors hover:bg-white/85 focus:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#16171b]"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload video
                </button>
              </div>
              {loading ? (
                <div className="py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                  <p className="text-text-secondary mt-4 text-sm">Loading videos...</p>
                </div>
              ) : (
                <VideoList
                  videos={videos}
                  onVideoDeleted={fetchVideos}
                  onVideoEdit={setEditingVideo}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {editingVideo && (
        <VideoEditModal
          video={editingVideo}
          isOpen={!!editingVideo}
          onClose={() => setEditingVideo(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default AdminPage;
