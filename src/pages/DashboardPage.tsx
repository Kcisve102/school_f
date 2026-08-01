import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '../types';
import { videoService } from '../services/video.service';
import { useAuth } from '../hooks/useAuth';
import { useScrollReveal } from '../hooks/useScrollReveal';
import VideoCard from '../components/video/VideoCard';
import WatchHistorySection from '../components/dashboard/WatchHistorySection';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import {
  LayoutDashboard,
  PlayCircle,
  Search,
  BookOpen,
  Bookmark,
  Settings,
  ChevronRight,
  History,
} from 'lucide-react';

type DashboardTab = 'dashboard' | 'history';

export const DashboardPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language].dashboard;
  const th = translations[language].history;

  useScrollReveal(undefined, [loading, activeTab]);

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
    { icon: LayoutDashboard, label: t.menuDashboard, tab: 'dashboard' as const, path: '/dashboard' },
    { icon: PlayCircle, label: t.menuMyVideos, tab: null, path: '/' },
    { icon: Search, label: t.menuBrowse, tab: null, path: '/categories' },
    { icon: BookOpen, label: t.menuCategories, tab: null, path: '/categories' },
    { icon: History, label: th.title, tab: 'history' as const, path: null },
    { icon: Bookmark, label: t.menuBookmarks, tab: null, path: '#' },
    { icon: Settings, label: t.menuSettings, tab: null, path: '#' },
  ];

  const handleMenuItemClick = (item: (typeof menuItems)[number]) => {
    if (item.tab) {
      setActiveTab(item.tab);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const sidebarMenuItems = menuItems.slice(0, 5);
  const sidebarPersonalItems = menuItems.slice(5);

  return (
    <div className="flex min-h-screen bg-page-gradient text-text-primary">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-64 bg-surface border-r border-border flex-col fixed h-full z-30">
        <div className="p-6">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">{t.mainMenu}</h2>
          <nav className="space-y-1">
            {sidebarMenuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleMenuItemClick(item)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  item.tab && item.tab === activeTab
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
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">{t.personal}</h2>
          <nav className="space-y-1">
            {sidebarPersonalItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleMenuItemClick(item)}
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
              <div className="w-10 h-10 rounded-full bg-info flex items-center justify-center text-white font-semibold text-sm">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{user.full_name}</p>
                <p className="text-xs text-text-muted">{user.is_admin ? translations[language].nav.roleAdmin : t.memberLabel}</p>
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
                onClick={() => handleMenuItemClick(item)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  item.tab && item.tab === activeTab
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
                placeholder={t.searchPlaceholder}
                className="w-full pl-12 pr-4 py-3 bg-surface-secondary border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">

            {activeTab === 'dashboard' ? (
              <>
                {/* Welcome */}
                <div className="mb-10 sm:mb-16 reveal-up">
                  <p className="font-display text-[0.6875rem] uppercase tracking-[0.3em] text-text-muted mb-6">
                    {t.continueStreak}
                  </p>
                  <h1 className="font-display font-medium text-text-primary text-[clamp(1.75rem,4.5vw,3.5rem)] leading-[1] tracking-[-0.03em]">
                    {t.welcomeBack}, {user?.full_name.split(' ')[0] || ''}
                  </h1>
                </div>

                {/* Stats — a divided band rather than three equal cards. Same
                    data, but the shared rules read as one instrument panel
                    instead of three competing objects. */}
                <div className="grid grid-cols-3 divide-x divide-border-subtle border-y border-border-subtle mb-12 lg:mb-20 reveal-up delay-1">
                  {[
                    { value: String(totalVideos).padStart(2, '0'), label: t.activeVideos },
                    { value: `${totalMinutes}`, label: t.timeSpent },
                    { value: String(readyVideos * 100), label: t.videosCompleted },
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

                {/* Recommended Videos */}
                <div className="mb-8 reveal-up">
                  <div className="flex items-end justify-between mb-8 gap-4">
                    <h2 className="font-display font-medium text-text-primary text-[clamp(1.25rem,3vw,2rem)] leading-[1] tracking-[-0.03em]">
                      {t.recommendedFor}
                    </h2>
                    <button className="group inline-flex items-center gap-3 border-b border-border-hover pb-2 font-display text-xs uppercase tracking-[0.15em] text-text-primary transition-colors hover:border-text-primary">
                      {t.seeAll}
                      <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </button>
                  </div>

                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
                    </div>
                  ) : videos.length === 0 ? (
                    <div className="text-center py-12 bg-surface rounded-xl border border-border">
                      <PlayCircle className="w-16 h-16 text-text-muted mx-auto mb-4" />
                      <p className="text-text-secondary text-lg mb-2">{t.noVideos}</p>
                      <p className="text-text-muted text-sm mb-6">{t.noVideosDesc}</p>
                      <button
                        onClick={() => navigate('/admin')}
                        className="px-6 py-3 bg-accent hover:bg-accent-dark text-bg-primary rounded-lg font-medium transition-all"
                      >
                        {t.uploadVideo}
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
              </>
            ) : (
              <WatchHistorySection />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
