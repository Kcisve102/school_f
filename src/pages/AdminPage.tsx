import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '../types';
import { videoService } from '../services/video.service';
import { useAuth } from '../hooks/useAuth';
import VideoUploadForm from '../components/admin/VideoUploadForm';
import VideoLinkForm from '../components/admin/VideoLinkForm';
import VideoList from '../components/admin/VideoList';
import VideoEditModal from '../components/video/VideoEditModal';
import {
  LayoutDashboard,
  Upload,
  BookOpen,
  Bookmark,
  Settings,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload');
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

  const handleUploadSuccess = () => fetchVideos();
  const handleEditSuccess = () => fetchVideos();

  const totalVideos = videos.length;
  const processedVideos = videos.filter(v => v.transcription_status === 'completed').length;
  const processingVideos = videos.filter(v => v.transcription_status === 'processing').length;

  const allNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true, path: '/admin' },
    { icon: BookOpen, label: 'Categories', active: false, path: '/categories' },
    { icon: Bookmark, label: 'Bookmarks', active: false, path: '#' },
    { icon: Settings, label: 'Settings', active: false, path: '#' },
  ];

  const sidebarMenuItems = allNavItems.slice(0, 2);
  const sidebarPersonalItems = allNavItems.slice(2);

  return (
    <div className="flex min-h-screen bg-page-gradient text-text-primary">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-64 bg-surface border-r border-border flex-col fixed h-full z-30">
        <div className="p-6">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Main Menu</h2>
          <nav className="space-y-1">
            {sidebarMenuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  item.active
                    ? 'bg-accent/10 text-accent border border-accent/30'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6 border-t border-border">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Personal</h2>
          <nav className="space-y-1">
            {sidebarPersonalItems.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        {user && (
          <div className="mt-auto p-6 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-hover border border-border flex items-center justify-center text-text-primary font-display text-sm">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{user.full_name}</p>
                <p className="text-xs text-text-muted">Admin</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto lg:ml-64">

        {/* ── Mobile: sticky top bar ── */}
        <div className="lg:hidden sticky top-0 z-30 bg-bg-primary/95 backdrop-blur-xl  border-border">
         

          {/* Horizontal scrollable nav */}
          <div className="flex gap-2 px-4 p-6 overflow-x-auto scrollbar-hide">
            {allNavItems.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  item.active
                    ? 'bg-accent/10 text-accent border border-accent/30'
                    : 'text-text-secondary bg-surface-secondary border border-border hover:text-text-primary hover:border-accent/30'
                }`}
              >
                <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">

            {/* Welcome */}
            <div className="mb-10 sm:mb-16">
              <p className="font-display text-[0.6875rem] uppercase tracking-[0.3em] text-text-muted mb-6">
                Manage videos and monitor platform statistics
              </p>
              <h1 className="font-display font-medium text-text-primary text-[clamp(1.75rem,4.5vw,3.5rem)] leading-[1] tracking-[-0.03em]">
                Admin
              </h1>
            </div>

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

            {/* Upload Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 lg:mb-12">
              <div className="bg-surface rounded-xl p-5 lg:p-6 border border-border">
                <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-accent" />
                  Upload Video
                </h3>
                <div className="flex border-b border-border mb-6">
                  <button
                    className={`px-4 py-2 font-medium text-sm transition-colors ${
                      activeTab === 'upload'
                        ? 'border-b-2 border-accent text-accent'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                    onClick={() => setActiveTab('upload')}
                  >
                    Upload File
                  </button>
                  <button
                    className={`px-4 py-2 font-medium text-sm transition-colors ${
                      activeTab === 'link'
                        ? 'border-b-2 border-accent text-accent'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                    onClick={() => setActiveTab('link')}
                  >
                    Upload from URL
                  </button>
                </div>
                {activeTab === 'upload' ? (
                  <VideoUploadForm onSuccess={handleUploadSuccess} />
                ) : (
                  <VideoLinkForm onSuccess={handleUploadSuccess} />
                )}
              </div>
            </div>

            {/* Video List */}
            <div>
              <h3 className="text-xl lg:text-2xl font-bold text-text-primary mb-6">Manage Videos</h3>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
                  <p className="text-text-secondary mt-4">Loading videos...</p>
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
