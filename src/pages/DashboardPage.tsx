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
import { PlayCircle, ChevronRight } from 'lucide-react';

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

  return (
    <div className="flex min-h-screen bg-page-gradient text-text-primary">

      {/*
        The sidebar is gone. It duplicated the app header's navigation, repeated
        the user identity already shown in the header pill, and of its seven
        items two pointed at '#', two both led to /categories, and one led to a
        route the header already links. Only Overview and History did anything,
        and a 256px fixed rail plus a full-width non-functional search bar was a
        lot of chrome around a heading, three numbers and four cards.

        What is left is the two real destinations, as a tab strip.
      */}
      <main className="flex-1">
        <div className="px-6 lg:px-12 xl:px-20 pt-10 sm:pt-16">
          <div className="max-w-[1600px]">
            <p className="font-display text-[0.6875rem] uppercase tracking-[0.3em] text-text-muted mb-5">
              {t.continueStreak}
            </p>
            <h1 className="font-display font-medium text-text-primary text-[clamp(1.75rem,5vw,4rem)] leading-[1] tracking-[-0.04em]">
              {t.welcomeBack}, {user?.full_name.split(' ')[0] || ''}
            </h1>

            <div className="flex gap-8 mt-10 sm:mt-14 border-b border-border-subtle">
              {([
                ['dashboard', t.menuDashboard],
                ['history', th.title],
              ] as const).map(([tab, label]) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative pb-4 font-display text-xs uppercase tracking-[0.15em] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white ${
                    activeTab === tab
                      ? 'text-text-primary after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-text-primary'
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 lg:px-12 xl:px-20 py-10 sm:py-14">
          <div className="max-w-[1600px]">

            {activeTab === 'dashboard' ? (
              <>
                {/* Stats read as one instrument panel rather than three cards.
                    The third cell previously showed `readyVideos * 100` under a
                    "videos completed" label — a points figure wearing a count's
                    name, which rendered as "2000" against a library of 20. */}
                <div className="grid grid-cols-3 divide-x divide-border-subtle border-y border-border-subtle mb-12 lg:mb-20 reveal-up">
                  {[
                    { value: String(totalVideos).padStart(2, '0'), label: t.activeVideos },
                    { value: `${totalMinutes}`, label: t.timeSpent },
                    { value: String(readyVideos).padStart(2, '0'), label: t.videosCompleted },
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
