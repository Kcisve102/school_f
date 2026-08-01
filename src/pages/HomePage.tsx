import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '../types';
import { videoService } from '../services/video.service';
import VideoGrid from '../components/video/VideoGrid';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import { ArrowRight, MessageSquare, Play, Search, Zap } from 'lucide-react';

/**
 * Home — generated under docs/design/DESIGN.md.
 *
 * Thesis: a technical instrument, not a brochure. The page carries one idea per
 * screen, and the display-to-body scale gap (~8:1 at desktop) does the work that
 * color and ornament would do elsewhere.
 *
 * Three rules this file follows that the previous version did not:
 *   - radius 0 everywhere (the lock); no rounded-xl, no pill CTAs
 *   - accent (#fff) is interactive-only — no glow, no tinted shadow, no fills
 *   - density alternates deliberately; a uniform section rhythm is the failure
 *     mode this thesis exists to avoid
 */
export const HomePage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language].home;

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

  const totalVideoMinutes = useMemo(() => {
    const totalSeconds = videos.reduce((sum, video) => sum + (video.duration ?? 0), 0);
    return Math.round(totalSeconds / 60);
  }, [videos]);

  const capabilities = [
    {
      icon: MessageSquare,
      title: t.featureAsk,
      description:
        language === 'en'
          ? 'Ask anything about machine learning, AI tools, LLMs, or getting started with AI.'
          : '随时提问机器学习、AI工具、大语言模型或AI入门方面的任何问题。',
    },
    { icon: Search, title: t.smartMatching, description: t.smartMatchingDesc },
    {
      icon: Zap,
      title: t.featureAlways,
      description:
        language === 'en'
          ? "Get help anytime — whether you're a beginner or diving deeper into advanced AI topics."
          : '无论是AI入门还是深入进阶，随时都能获得帮助。',
    },
  ];

  const stats = [
    { value: String(videos.length).padStart(2, '0'), label: t.stat1Label },
    { value: String(totalVideoMinutes), label: t.stat2Label },
    { value: '03', label: t.stat3Label },
  ];

  return (
    <div className="min-h-screen bg-page-gradient">
      {/*
        HERO — the signature moment.
        Hard left edge, oversized mono, wrapping where the viewport dictates.
        Everything below is quiet so this one thing carries the page.
      */}
      <section className="relative border-b border-border-subtle">
        <div className="px-6 lg:px-12 xl:px-20 pt-24 pb-16 sm:pt-40 sm:pb-28">
          <div className="max-w-[1600px] mx-auto">
            <p className="font-display text-[0.6875rem] uppercase tracking-[0.3em] text-text-muted mb-10 sm:mb-16">
              {t.badge}
            </p>

            <h1 className="font-display font-medium text-text-primary text-[clamp(2.5rem,11vw,9rem)] leading-[0.92] tracking-[-0.04em] max-w-[18ch]">
              {t.headline1}
            </h1>

            {/* The second line sits deliberately out of the headline's optical
                block — a grid break rather than a centered continuation. */}
            <p className="font-display text-text-secondary text-[clamp(1rem,2.6vw,2rem)] leading-tight tracking-[-0.02em] mt-6 sm:mt-10 sm:ml-[8vw] max-w-[24ch]">
              {t.headline2}
            </p>

            <div className="mt-12 sm:mt-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-end">
              <p className="lg:col-span-5 text-base sm:text-lg text-text-secondary leading-relaxed max-w-[46ch]">
                {t.subheadline}
              </p>

              <div className="lg:col-span-7 flex flex-col sm:flex-row gap-0 sm:gap-px lg:justify-end">
                <button
                  onClick={() => navigate('/chat')}
                  className="group flex items-center justify-between sm:justify-center gap-6 bg-white text-[#16171b] px-8 py-5 font-display text-sm uppercase tracking-[0.09em] transition-colors hover:bg-white/85 focus:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#16171b]"
                >
                  {t.ctaChat}
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => navigate('/categories')}
                  className="group flex items-center justify-between sm:justify-center gap-6 border border-border-hover px-8 py-5 font-display text-sm uppercase tracking-[0.09em] text-text-primary transition-colors hover:bg-surface-hover hover:border-text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#16171b]"
                >
                  {t.ctaBrowse}
                  <Play className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*
        STATS — the dense band. Deliberately tight against the hero's emptiness;
        this contrast is the VISUAL_DENSITY: varied dial doing its job.
      */}
      <section className="border-b border-border-subtle">
        <div className="px-6 lg:px-12 xl:px-20">
          <div className="max-w-[1600px] mx-auto grid grid-cols-3 divide-x divide-border-subtle">
            {stats.map((s) => (
              <div key={s.label} className="py-8 sm:py-12 first:pl-0 px-4 sm:px-8">
                <p className="font-display text-text-primary text-[clamp(1.75rem,5vw,3.5rem)] leading-none tracking-[-0.03em]">
                  {s.value}
                </p>
                <p className="font-display text-[0.6875rem] uppercase tracking-[0.2em] text-text-muted mt-3">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*
        CAPABILITIES — a numbered spec list, not a card grid.
        Rows rather than three equal cards: the ban list prohibits the latter, and
        rows also let each item's copy run to its natural length.
      */}
      <section className="border-b border-border-subtle">
        <div className="px-6 lg:px-12 xl:px-20 py-20 sm:py-32">
          <div className="max-w-[1600px] mx-auto">
            {/* Eyebrow sits in the left margin; the heading holds the same hard
                left edge as the hero. A col-span-9 heading with a max-width
                floats mid-canvas and reads as centered, which breaks the
                single-left-edge rhythm this thesis depends on. */}
            <div className="mb-12 sm:mb-20 reveal-up">
              <p className="font-display text-[0.6875rem] uppercase tracking-[0.3em] text-text-muted mb-6">
                {t.howItWorks}
              </p>
              <h2 className="font-display font-medium text-text-primary text-[clamp(1.75rem,4.5vw,3.5rem)] leading-[1] tracking-[-0.03em] max-w-[20ch]">
                {t.learningMadeSimple}
              </h2>
            </div>

            <div className="border-t border-border-subtle">
              {capabilities.map((c, i) => (
                <div
                  key={c.title}
                  className={`group grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-baseline border-b border-border-subtle py-8 sm:py-12 transition-colors hover:bg-surface/40 reveal-up ${['delay-1', 'delay-2', 'delay-3'][i] ?? ''}`}
                >
                  <p className="lg:col-span-1 font-display text-sm text-text-muted tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <div className="lg:col-span-1">
                    <c.icon className="w-5 h-5 text-text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="lg:col-span-4 font-display text-text-primary text-xl sm:text-2xl tracking-[-0.02em]">
                    {c.title}
                  </h3>
                  <p className="lg:col-span-6 text-text-secondary leading-relaxed max-w-[52ch]">
                    {c.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/*
        LIBRARY — asymmetric header, then the existing grid untouched.
        VideoGrid is out of scope for this override.
      */}
      <section className="border-b border-border-subtle">
        <div className="px-6 lg:px-12 xl:px-20 py-20 sm:py-32">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12 sm:mb-16 reveal-up">
              <div>
                <p className="font-display text-[0.6875rem] uppercase tracking-[0.3em] text-text-muted mb-6">
                  {t.videoLibraryLabel}
                </p>
                <h2 className="font-display font-medium text-text-primary text-[clamp(1.75rem,4.5vw,3.5rem)] leading-[1] tracking-[-0.03em]">
                  {t.latestVideos}
                </h2>
              </div>
              <button
                onClick={() => navigate('/categories')}
                className="group inline-flex items-center gap-4 self-start sm:self-auto border-b border-border-hover pb-2 font-display text-xs uppercase tracking-[0.15em] text-text-primary transition-colors hover:border-text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
              >
                {t.viewAllVideos}
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </div>

            <VideoGrid videos={videos.slice(0, 4)} loading={loading} mobile2x2 />
          </div>
        </div>
      </section>

      {/*
        CLOSE — near-empty by design. The page ends on the same emptiness it
        opened with, so the dense middle reads as deliberate rather than uneven.
      */}
      <section>
        <div className="px-6 lg:px-12 xl:px-20 py-24 sm:py-40">
          <div className="max-w-[1600px] mx-auto">
            <h2 className="font-display font-medium text-text-primary text-[clamp(1.75rem,6vw,4.5rem)] leading-[0.95] tracking-[-0.03em] max-w-[16ch] reveal-up">
              {t.ctaHeadline}
            </h2>
            <div className="mt-10 sm:mt-16 flex flex-col sm:flex-row gap-0 sm:gap-px reveal-up delay-1">
              <button
                onClick={() => navigate('/chat')}
                className="group flex items-center justify-between sm:justify-center gap-6 bg-white text-[#16171b] px-8 py-5 font-display text-sm uppercase tracking-[0.09em] transition-colors hover:bg-white/85 focus:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#16171b]"
              >
                {t.ctaChat}
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="flex items-center justify-between sm:justify-center gap-6 border border-border-hover px-8 py-5 font-display text-sm uppercase tracking-[0.09em] text-text-primary transition-colors hover:bg-surface-hover hover:border-text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#16171b]"
              >
                {t.createAccount}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
