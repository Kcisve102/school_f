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
  CheckCircle,
  Clock,
  BookOpen,
  Bookmark,
  Settings,
  Video as VideoIcon,
} from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle';

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

  const handleUploadSuccess = () => {
    fetchVideos();
  };

  const handleEditSuccess = () => {
    fetchVideos();
  };

  // Calculate stats
  const totalVideos = videos.length;
  const processedVideos = videos.filter(v => v.transcription_status === 'completed').length;
  const processingVideos = videos.filter(v => v.transcription_status === 'processing').length;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true, path: '/admin' },
    // { icon: PlayCircle, label: 'All Videos', active: false, path: '/' },
    // { icon: Search, label: 'Browse', active: false, path: '/categories' },
    { icon: BookOpen, label: 'Categories', active: false, path: '/categories' },
  ];

  const personalItems = [
    { icon: Bookmark, label: 'Bookmarks', path: '#' },
    { icon: Settings, label: 'Settings', path: '#' },
  ];

  return (
    <div className="flex min-h-screen bg-bg-primary text-text-primary">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col fixed h-full">
        <div className="p-6">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
            Main Menu
          </h2>
          <nav className="space-y-1">
            {menuItems.map((item, index) => (
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
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
            Personal
          </h2>
          <nav className="space-y-1">
            {personalItems.map((item, index) => (
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

        {/* User Profile at Bottom */}
        {user && (
          <div className="mt-auto p-6 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-info flex items-center justify-center text-white font-semibold">
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

      {/* Main Content */}
      <main className="flex-1 overflow-auto ml-64">
        <div className="p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-text-secondary">
                  Manage videos and monitor platform statistics
                </p>
              </div>
              <ThemeToggle />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-surface rounded-xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <VideoIcon className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-sm text-text-secondary">Total Videos</span>
                </div>
                <div className="text-4xl font-bold text-text-primary mb-1">{totalVideos}</div>
                <div className="text-sm text-text-muted">All uploaded videos</div>
              </div>

              <div className="bg-surface rounded-xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-success/10">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <span className="text-sm text-text-secondary">Processed</span>
                </div>
                <div className="text-4xl font-bold text-text-primary mb-1">{processedVideos}</div>
                <div className="text-sm text-text-muted">Ready for learning</div>
              </div>

              <div className="bg-surface rounded-xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-info/10">
                    <Clock className="w-5 h-5 text-info" />
                  </div>
                  <span className="text-sm text-text-secondary">Processing</span>
                </div>
                <div className="text-4xl font-bold text-text-primary mb-1">{processingVideos}</div>
                <div className="text-sm text-text-muted">In queue</div>
              </div>
            </div>

            {/* Upload Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              <div className="bg-surface rounded-xl p-6 border border-border">
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
              <h3 className="text-2xl font-bold text-text-primary mb-6">Manage Videos</h3>
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

      {/* Edit Modal */}
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
