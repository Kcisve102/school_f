import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '../types';
import { videoService } from '../services/video.service';
import { useAuth } from '../hooks/useAuth';
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

  // Calculate stats from video data
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
  ];

  const personalItems = [
    { icon: Bookmark, label: 'Bookmarks', path: '#' },
    { icon: Settings, label: 'Settings', path: '#' },
  ];

  return (
    <div className="flex min-h-screen bg-[#0a0a1f] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f0f23] border-r border-white/10 flex flex-col fixed h-full">
        <div className="p-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Main Menu
          </h2>
          <nav className="space-y-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  item.active
                    ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border border-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-white/10">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Personal
          </h2>
          <nav className="space-y-1">
            {personalItems.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* User Profile at Bottom */}
        {user && (
          <div className="mt-auto p-6 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-semibold">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
                <p className="text-xs text-gray-400">{user.is_admin ? 'Admin' : 'Member'}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto ml-64">
        {/* Search Bar */}
        <div className="bg-[#0f0f23]/50 backdrop-blur-xl border-b border-white/10 p-6 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search courses, lessons, resources..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Welcome back, {user?.full_name.split(' ')[0] || 'there'}!
              </h1>
              <p className="text-gray-400">
                Continue where you left off and keep up your daily streak.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="text-sm text-gray-400">This Month</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1">{totalVideos}</div>
                <div className="text-sm text-gray-400">Active Videos</div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-sm text-gray-400">Weekly Goal</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1">{totalMinutes}m</div>
                <div className="text-sm text-gray-400">Time Spent Learning</div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Trophy className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="text-sm text-gray-400">Total Points</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1">{readyVideos * 100}</div>
                <div className="text-sm text-gray-400">Videos Completed</div>
              </div>
            </div>

            {/* Recommended Videos */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Recommended for you</h2>
                <button className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
                  <span className="text-sm font-medium">See all</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                </div>
              ) : videos.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                  <PlayCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">No videos yet</p>
                  <p className="text-gray-500 text-sm mb-6">
                    Upload your first video to get started!
                  </p>
                  <button
                    onClick={() => navigate('/admin')}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-500 hover:to-blue-500 transition-all"
                  >
                    Upload Video
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
