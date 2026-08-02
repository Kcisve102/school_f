import React, { useEffect, useState } from 'react';
import { Video } from '../types';
import { videoService } from '../services/video.service';
import { useScrollReveal } from '../hooks/useScrollReveal';
import VideoCard from '../components/video/VideoCard';
import Pagination from '../components/common/Pagination';
import { CATEGORIES } from '../constants/categories';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import { Grid3X3, List, Search, PlayCircle } from 'lucide-react';

const PAGE_SIZE = 10;

export const CategoriesPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const { language } = useLanguage();
  const t = translations[language].categories;
  const tHome = translations[language].home;

  useScrollReveal(undefined, [loading, selectedCategory]);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        let data: Video[];
        if (selectedCategory === 'all') {
          data = await videoService.getAll();
        } else {
          data = await videoService.getByCategory(selectedCategory);
        }
        setVideos(data);
      } catch (error) {
        console.error('Failed to fetch videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [selectedCategory]);

  // Filter videos by search query
  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  /* Paged client-side rather than by request. Search matches title and
     description across the whole category, so paging on the server would
     narrow it to whichever ten rows happened to be loaded. Filter first,
     then slice — the pager follows the search results. */
  const totalPages = Math.ceil(filteredVideos.length / PAGE_SIZE);
  const pagedVideos = filteredVideos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // A narrowed search or a new category can leave the current page past the
  // end of the results; step back rather than render an empty grid.
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory]);

  const handleCategorySelect = (category: string | 'all') => {
    setSelectedCategory(category);
  };

  // Get category display name (translated)
  const getCategoryLabel = (cat: string): string => {
    const map: Record<string, string> = {
      'AI Skills': tHome.factorySkills,
      'Safety Guide': tHome.safetyGuide,
      'Language': tHome.language,
      'Health': tHome.healthWellness,
    };
    return map[cat] || cat;
  };

  // Get category display name
  const getCategoryDisplayName = () => {
    if (selectedCategory === 'all') return t.allVideos;
    return getCategoryLabel(selectedCategory);
  };

  // Get video count text
  const getVideoCountText = () => {
    const count = filteredVideos.length;
    if (count === 0) return t.noVideo;
    if (count === 1) return t.oneVideo;
    return `${count} ${t.videos}`;
  };

  const tabs: Array<{ key: string | 'all'; label: string }> = [
    { key: 'all', label: t.allVideos },
    ...CATEGORIES.map((c) => ({ key: c as string, label: getCategoryLabel(c) })),
  ];

  return (
    <div className="min-h-screen">
      {/*
        Same shape as the dashboard: masthead, then the real destinations as a
        tab strip, then content.

        The previous layout carried four separate navigation surfaces for the
        same three categories — a fixed mobile header, a bottom-sheet drawer, a
        288px desktop rail and a sticky header bar. Three choices do not need
        288px of permanent furniture, and returning that width to the grid fits
        another column of cards.
      */}
      <div className="px-6 lg:px-12 xl:px-20 pt-10 sm:pt-16">
        <div className="max-w-[1600px]">
          <p className="font-display text-[0.6875rem] uppercase tracking-[0.3em] text-text-muted mb-5">
            {getVideoCountText()} {t.available}
          </p>
          <h1 className="font-display font-medium text-text-primary text-[clamp(1.75rem,5vw,4rem)] leading-[1] tracking-[-0.04em]">
            {getCategoryDisplayName()}
          </h1>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-10 sm:mt-14 border-b border-border-subtle">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleCategorySelect(tab.key)}
                className={`relative pt-2 pb-4 min-h-[44px] font-display text-xs uppercase tracking-[0.15em] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white ${
                  selectedCategory === tab.key
                    ? 'text-text-primary after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-text-primary'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-12 xl:px-20 py-8 sm:py-10">
        <div className="max-w-[1600px]">
          {/* Search and view mode sit on one utility row above the grid rather
              than in a rail — both act on what is directly below them. */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="relative flex-1 min-w-[16rem] max-w-md">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-transparent border-0 border-b border-border-subtle pl-7 pr-4 py-3 text-text-primary placeholder-text-muted focus:outline-none focus:border-text-primary transition-colors"
              />
            </div>

            <div className="flex items-center border border-border-subtle">
              {([
                ['grid', Grid3X3],
                ['list', List],
              ] as const).map(([mode, Icon]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  aria-label={mode === 'grid' ? 'Grid view' : 'List view'}
                  className={`p-3 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors ${
                    viewMode === mode
                      ? 'bg-surface-hover text-text-primary'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-20">
              <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              <p className="text-text-secondary mt-4 text-sm">{t.loadingVideos}</p>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="py-20 max-w-[46ch]">
              <PlayCircle className="w-8 h-8 text-text-muted mb-6" strokeWidth={1.5} />
              <h3 className="font-display font-medium text-text-primary text-xl tracking-[-0.02em] mb-3">
                {searchQuery ? t.noMatchingVideos : t.noVideos}
              </h3>
              <p className="text-text-secondary leading-relaxed">
                {searchQuery ? t.noMatchingDesc : t.noVideosDesc}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-5 gap-y-8 lg:gap-x-6 lg:gap-y-12">
              {pagedVideos.map((video, i) => (
                <VideoCard key={video.id} video={video} index={i} />
              ))}
            </div>
          ) : (
            <div className="border-t border-border-subtle">
              {pagedVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => (window.location.href = `/video/${video.id}`)}
                  className="group grid grid-cols-[7rem_1fr] sm:grid-cols-[10rem_1fr_auto] gap-5 items-center border-b border-border-subtle py-4 cursor-pointer transition-colors hover:bg-surface/40"
                >
                  <div className="relative aspect-video overflow-hidden bg-surface-secondary">
                    <video
                      src={video.s3_url}
                      preload="metadata"
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      onLoadedMetadata={(e) => {
                        const el = e.target as HTMLVideoElement;
                        if (el.duration && isFinite(el.duration)) {
                          el.currentTime = Math.min(1, el.duration * 0.1);
                        }
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLVideoElement;
                        target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                      <PlayCircle className="w-7 h-7 text-white opacity-80" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-display text-text-primary tracking-[-0.01em] truncate">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-sm text-text-secondary line-clamp-2 mt-2 max-w-[70ch]">
                        {video.description}
                      </p>
                    )}
                  </div>

                  <div className="hidden sm:flex flex-col items-end gap-2 font-display text-[0.625rem] uppercase tracking-[0.15em] text-text-muted">
                    <span>{video.category ? getCategoryLabel(video.category) : t.uncategorized}</span>
                    {video.duration && <span>{Math.round(video.duration / 60)} {t.min}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredVideos.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12">
              <p className="font-display text-[0.6875rem] uppercase tracking-[0.2em] text-text-muted tabular-nums">
                {(page - 1) * PAGE_SIZE + 1}&ndash;
                {Math.min(page * PAGE_SIZE, filteredVideos.length)} of {filteredVideos.length}
              </p>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
