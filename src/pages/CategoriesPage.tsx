import React, { useEffect, useState } from 'react';
import { Video } from '../types';
import { videoService } from '../services/video.service';
import { useScrollReveal } from '../hooks/useScrollReveal';
import VideoCard from '../components/video/VideoCard';
import { CATEGORIES } from '../constants/categories';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import {
  ChevronDown,
  Grid3X3,
  List,
  X,
  Filter,
  Search,
  PlayCircle
} from 'lucide-react';

// Category configurations with icons and colors
const CATEGORY_CONFIG: Record<string, { color: string; bgColor: string; borderColor: string }> = {
  'AI Skills': {
    color: 'text-factory',
    bgColor: 'bg-factory/10',
    borderColor: 'border-factory/30'
  },
  // 'Safety Guide': {
  //   color: 'text-safety',
  //   bgColor: 'bg-safety/10',
  //   borderColor: 'border-safety/30'
  // },
  'Language': {
    color: 'text-language',
    bgColor: 'bg-language/10',
    borderColor: 'border-language/30'
  },
  'Other': {
    color: 'text-other',
    bgColor: 'bg-other/10',
    borderColor: 'border-other/30'
  },
  // 'Health': {
  //   color: 'text-health',
  //   bgColor: 'bg-health/10',
  //   borderColor: 'border-health/30'
  // },
};

export const CategoriesPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const { language } = useLanguage();
  const t = translations[language].categories;
  const tHome = translations[language].home;

  useScrollReveal();

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

  const handleCategorySelect = (category: string | 'all') => {
    setSelectedCategory(category);
    setIsMobileMenuOpen(false);
  };

  // Get category display name (translated)
  const getCategoryLabel = (cat: string): string => {
    const map: Record<string, string> = {
      'Factory Skills': tHome.factorySkills,
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

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {/* Mobile Header - Fixed at top */}
      <header className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-bg-primary/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-bold text-text-primary">{getCategoryDisplayName()}</h1>
            <p className="text-xs text-text-muted">{getVideoCountText()}</p>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-surface-secondary border border-border rounded-lg text-sm font-medium"
          >
            <Filter className="w-4 h-4" />
            {t.filter}
          </button>
        </div>

        {/* Mobile Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-secondary border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50"
            />
          </div>
        </div>

        {/* Mobile Category Pills - Horizontal Scroll */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-accent text-white'
                : 'bg-surface-secondary text-text-secondary border border-border'
            }`}
          >
            {t.allCategories}
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-accent text-white'
                  : 'bg-surface-secondary text-text-secondary border border-border'
              }`}
            >
              {getCategoryLabel(category)}
            </button>
          ))}
        </div>
      </header>

      {/* Mobile Filter Drawer */}
      {isMobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-surface rounded-t-2xl border-t border-border max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-text-primary">{t.filterByCategory}</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-surface-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>

            <div className="p-4 space-y-2">
              <button
                onClick={() => handleCategorySelect('all')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-accent-subtle border border-accent/30'
                    : 'bg-surface-secondary border border-border hover:border-accent/20'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedCategory === 'all' ? 'bg-accent' : 'bg-surface'
                }`}>
                  <Grid3X3 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className={`font-semibold ${selectedCategory === 'all' ? 'text-accent' : 'text-text-primary'}`}>
                    {t.allCategories}
                  </div>
                  <div className="text-sm text-text-muted">{t.viewAllVideos}</div>
                </div>
                {selectedCategory === 'all' && (
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                    <ChevronDown className="w-4 h-4 text-white rotate-180" />
                  </div>
                )}
              </button>

              {CATEGORIES.map((category) => {
                const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG['Other'];
                const isSelected = selectedCategory === category;

                return (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                      isSelected
                        ? `${config.bgColor} border ${config.borderColor}`
                        : 'bg-surface-secondary border border-border hover:border-accent/20'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isSelected ? config.bgColor : 'bg-surface'
                    }`}>
                      <PlayCircle className={`w-6 h-6 ${isSelected ? config.color : 'text-text-muted'}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`font-semibold ${isSelected ? config.color : 'text-text-primary'}`}>
                        {getCategoryLabel(category)}
                      </div>
                      <div className="text-sm text-text-muted">{t.trainingVideos}</div>
                    </div>
                    {isSelected && (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${config.bgColor}`}>
                        <ChevronDown className={`w-4 h-4 rotate-180 ${config.color}`} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="flex min-h-screen pt-32 lg:pt-0">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 bg-surface border-r border-border p-6 fixed h-full overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-2">{t.heading}</h2>
            <p className="text-sm text-text-muted">{t.browseCollections}</p>
          </div>

          {/* Desktop Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-secondary border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => handleCategorySelect('all')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                selectedCategory === 'all'
                  ? 'bg-accent-subtle border border-accent/30 text-accent'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary border border-transparent'
              }`}
            >
              <Grid3X3 className="w-5 h-5" />
              <span className="font-medium">{t.allCategories}</span>
              {selectedCategory === 'all' && (
                <div className="ml-auto w-2 h-2 rounded-full bg-accent" />
              )}
            </button>

            {CATEGORIES.map((category) => {
              const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG['Other'];
              const isSelected = selectedCategory === category;

              return (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                    isSelected
                      ? `${config.bgColor} border ${config.borderColor} ${config.color}`
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary border border-transparent'
                  }`}
                >
                  <PlayCircle className="w-5 h-5" />
                  <span className="font-medium">{getCategoryLabel(category)}</span>
                  {isSelected && (
                    <div className={`ml-auto w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')}`} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop Stats */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="text-sm text-text-muted mb-1">{t.totalVideos}</div>
            <div className="text-2xl font-bold text-text-primary">{videos.length}</div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-72">
          {/* Desktop Header */}
          <div className="hidden lg:block sticky top-0 z-30 bg-bg-primary/95 backdrop-blur-xl border-b border-border px-8 py-6 reveal-up">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-text-primary mb-1">
                  {getCategoryDisplayName()}
                </h1>
                <p className="text-text-secondary">
                  {getVideoCountText()} {t.available}
                </p>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-surface-secondary rounded-lg p-1 border border-border">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-surface text-text-primary' : 'text-text-muted hover:text-text-secondary'
                  }`}
                  title={t.gridView}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-surface text-text-primary' : 'text-text-muted hover:text-text-secondary'
                  }`}
                  title={t.listView}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-4 lg:p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                <p className="text-text-secondary mt-4">{t.loadingVideos}</p>
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-2xl bg-surface-secondary flex items-center justify-center mb-4">
                  <PlayCircle className="w-10 h-10 text-text-muted" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  {searchQuery ? t.noMatchingVideos : t.noVideos}
                </h3>
                <p className="text-text-muted max-w-md">
                  {searchQuery ? t.noMatchingDesc : t.noVideosDesc}
                </p>
              </div>
            ) : (
              <>
                {/* Grid View */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
                    {filteredVideos.map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                )}

                {/* List View (Desktop only) */}
                {viewMode === 'list' && (
                  <div className="space-y-3">
                    {filteredVideos.map((video) => (
                      <div
                        key={video.id}
                        onClick={() => window.location.href = `/video/${video.id}`}
                        className="flex gap-4 p-4 bg-surface border border-border rounded-xl hover:bg-surface-secondary hover:border-accent/30 transition-all cursor-pointer group"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-surface-secondary">
                          <video
                            src={video.s3_url}
                            preload="metadata"
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            onError={(e) => {
                              const target = e.target as HTMLVideoElement;
                              target.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                            <PlayCircle className="w-8 h-8 text-white opacity-80" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-text-primary mb-1 group-hover:text-accent transition-colors truncate">
                            {video.title}
                          </h3>
                          {video.description && (
                            <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                              {video.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-text-muted">
                            <span className="px-2 py-1 bg-surface-secondary rounded-md border border-border">
                              {video.category ? getCategoryLabel(video.category) : t.uncategorized}
                            </span>
                            {video.duration && (
                              <span>{Math.round(video.duration / 60)} {t.min}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CategoriesPage;
