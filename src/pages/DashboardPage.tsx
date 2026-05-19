import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '../types';
import { videoService } from '../services/video.service';
import { useAuth } from '../hooks/useAuth';
import { useScrollReveal } from '../hooks/useScrollReveal';
import VideoCard from '../components/video/VideoCard';
import {
  LayoutDashboard,
  PlayCircle,
  Search,
  Clock,
  Trophy,
  BookOpen,
  Bookmark,
  Settings,
  ChevronRight,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useScrollReveal(undefined, [loading]);

  useEffect(() => {
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
    fetchVideos();
  }, []);

  const totalVideos = videos.length;
  const readyVideos = videos.filter(v =>
    v.transcription_status === 'completed' &&
    v.summary_status === 'completed'
  ).length;
  const totalMinutes = Math.floor(
    videos.reduce((sum, video) => sum + (video.duration || 0), 0) / 60
  );

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true, path: '/dashboard' },
    { icon: PlayCircle, label: 'My Videos', active: false, path: '/' },
    { icon: Search, label: 'Browse', active: false, path: '/categories' },
    { icon: BookOpen, label: 'Categories', active: false, path: '/categories' },
    { icon: Bookmark, label: 'Bookmarks', active: false, path: '#' },
    { icon: Settings, label: 'Settings', active: false, path: '#' },
  ];

  const sidebarMenuItems = menuItems.slice(0, 4);
  const sidebarPersonalItems = menuItems.slice(4);

  return (
    <div className="flex min-h-screen bg-bg-primary text-text-primary">

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
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-info flex items-center justify-center text-white font-semibold text-sm">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{user.full_name}</p>
                <p className="text-xs text-text-muted">{user.is_admin ? 'Admin' : 'Member'}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto lg:ml-64">

        {/* ── Mobile: sticky top bar ── */}
        <div className="lg:hidden sticky top-0 z-30 bg-bg-primary/95 backdrop-blur-xl border-border">


          {/* Horizontal scrollable nav */}
          <div className="flex gap-2 px-4 p-6 overflow-x-auto scrollbar-hide">
            {menuItems.map((item, index) => (
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

        {/* Search Bar */}
        <div className="bg-bg-primary/95 backdrop-blur-xl border-b border-border p-4 lg:p-6 sticky top-[93px] lg:top-0 z-20">
          <div className="max-w-7xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                placeholder="Search courses, lessons, resources..."
                className="w-full pl-12 pr-4 py-3 bg-surface-secondary border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">

            {/* Welcome */}
            <div className="mb-8 reveal-up">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary mb-2">
                Welcome back, {user?.full_name.split(' ')[0] || 'there'}!
              </h1>
              <p className="text-text-secondary">
                Continue where you left off and keep up your daily streak.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-10 lg:mb-12">
              <div className="bg-surface rounded-xl p-5 lg:p-6 border border-border reveal-up delay-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <BookOpen className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-sm text-text-muted">This Month</span>
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-text-primary mb-1">{totalVideos}</div>
                <div className="text-sm text-text-secondary">Active Videos</div>
              </div>

              <div className="bg-surface rounded-xl p-5 lg:p-6 border border-border reveal-up delay-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-info/10">
                    <Clock className="w-5 h-5 text-info" />
                  </div>
                  <span className="text-sm text-text-muted">Weekly Goal</span>
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-text-primary mb-1">{totalMinutes}m</div>
                <div className="text-sm text-text-secondary">Time Spent Learning</div>
              </div>

              <div className="bg-surface rounded-xl p-5 lg:p-6 border border-border reveal-up delay-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-success/10">
                    <Trophy className="w-5 h-5 text-success" />
                  </div>
                  <span className="text-sm text-text-muted">Total Points</span>
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-text-primary mb-1">{readyVideos * 100}</div>
                <div className="text-sm text-text-secondary">Videos Completed</div>
              </div>
            </div>

            {/* Recommended Videos */}
            <div className="mb-8 reveal-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-text-primary">Recommended for you</h2>
                <button className="flex items-center gap-2 text-accent hover:text-accent-dark transition-colors">
                  <span className="text-sm font-medium">See all</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
                </div>
              ) : videos.length === 0 ? (
                <div className="text-center py-12 bg-surface rounded-xl border border-border">
                  <PlayCircle className="w-16 h-16 text-text-muted mx-auto mb-4" />
                  <p className="text-text-secondary text-lg mb-2">No videos yet</p>
                  <p className="text-text-muted text-sm mb-6">Upload your first video to get started!</p>
                  <button
                    onClick={() => navigate('/admin')}
                    className="px-6 py-3 bg-accent hover:bg-accent-dark text-white rounded-lg font-medium transition-all"
                  >
                    Upload Video
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                  {videos.slice(0, 4).map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
