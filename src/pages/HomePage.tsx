import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '../types';
import { videoService } from '../services/video.service';
import VideoGrid from '../components/video/VideoGrid';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import {
  ArrowRight,
  Bot,
  MessageSquare,
  Play,
  Wrench,
  Shield,
  Languages,
  Heart,
  Zap,
  Search,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language].home;

  useScrollReveal();

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

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const AI_CAPABILITIES = [
    {
      icon: MessageSquare,
      title: t.featureAsk,
      description: language === 'en'
        ? 'Ask anything about factory operations, safety procedures, or equipment handling.'
        : '随时提问工厂操作、安全规程或设备处理方面的任何问题。',
    },
    {
      icon: Search,
      title: t.smartMatching,
      description: t.smartMatchingDesc,
    },
    {
      icon: Zap,
      title: t.featureAlways,
      description: language === 'en'
        ? "Get help anytime, whether you're on the night shift or preparing for the day."
        : '无论是夜班还是白班准备，随时都能获得帮助。',
    },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero Section - Full Background with Centered Content */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        >
          <img
            src="/assets/herodv.png"
            alt="Smart Factory Environment"
            className="w-full h-full object-cover"
          />
          {/* Theme-aware overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent dark:from-bg-primary dark:via-bg-primary/60 dark:to-transparent"></div>
        </div>

        {/* Content - Centered */}
        <div className="relative z-10 w-full px-6 lg:px-12 xl:px-20 py-32 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-surface/70 backdrop-blur-sm rounded-full px-5 py-2.5 mb-8 border border-border">
              <Bot className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-text-primary tracking-wide">{t.badge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6 leading-tight drop-shadow-sm">
              {t.headline1}
              <span className="block text-accent mt-2">{t.headline2}</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-text-primary max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-sm font-medium">
              {t.subheadline}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button
                onClick={() => navigate('/chat')}
                className="group inline-flex items-center justify-center gap-3 bg-accent text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-accent-dark transition-all duration-300 shadow-xl shadow-accent/25"
              >
                {t.ctaChat}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/categories')}
                className="inline-flex items-center justify-center gap-2 bg-surface/70 backdrop-blur-sm hover:bg-surface text-text-primary px-8 py-4 rounded-xl font-medium text-lg border border-border transition-all duration-300"
              >
                <Play className="w-5 h-5" />
                {t.ctaBrowse}
              </button>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                { icon: MessageSquare, title: t.featureAsk, desc: t.featureAskDesc },
                { icon: Play, title: t.featureVideo, desc: t.featureVideoDesc },
                { icon: Zap, title: t.featureAlways, desc: t.featureAlwaysDesc },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center gap-3 p-4 bg-surface/50 backdrop-blur-sm rounded-2xl border border-border"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-text-primary">{feature.title}</div>
                    <div className="text-sm text-text-secondary">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-px h-12 bg-gradient-to-b from-accent to-transparent"></div>
        </div>
      </section>

      {/* AI Capabilities Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Background Image - dvb.png as subtle backdrop */}
        <div className="absolute inset-0 opacity-20">
          <img
            src="/assets/dvb.png"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-bg-primary/95 to-bg-primary"></div>
        </div>

        <div className="relative px-6 lg:px-12 xl:px-20">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-20 reveal-up">
              <div className="inline-flex items-center gap-2 bg-surface-secondary rounded-full px-4 py-2 mb-6 border border-border">
                <Bot className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-text-secondary">{t.howItWorks}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
                {t.learningMadeSimple}
              </h2>
              <p className="text-xl text-text-secondary">
                {t.learningDesc}
              </p>
            </div>

            {/* Capabilities Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {AI_CAPABILITIES.map((capability, index) => (
                <div
                  key={index}
                  className={`group relative reveal-up delay-${index + 1}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                  <div className="relative bg-surface border border-border rounded-2xl p-8 hover:border-accent/30 transition-all duration-300">
                    <div className="w-14 h-14 rounded-xl bg-accent-subtle flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <capability.icon className="w-7 h-7 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary mb-3">
                      {capability.title}
                    </h3>
                    <p className="text-text-secondary leading-relaxed">
                      {capability.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Visual Learning Section - Asymmetric Editorial Layout */}
      <section className="relative py-32 overflow-hidden">
        {/* Full-bleed Background */}
        <div className="absolute inset-0">
          <img
            src="/assets/video_player.png"
            alt=""
            className="w-full h-full object-cover opacity-15 dark:opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-bg-primary/95 via-bg-primary/90 to-info/5"></div>
        </div>

        <div className="relative px-6 lg:px-12 xl:px-20">
          <div className="max-w-7xl mx-auto">
            {/* Asymmetric Two Column Layout */}
            <div className="grid lg:grid-cols-12 gap-12 items-center">

              {/* Left Column - Large Typography */}
              <div className="lg:col-span-7 reveal-left">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-px bg-info"></div>
                  <span className="text-sm font-semibold text-info uppercase tracking-widest">{t.videoLearningLabel}</span>
                </div>

                <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold text-text-primary leading-[0.9] mb-8">
                  {t.watchAnd}
                  <span className="block text-info">{t.learn}</span>
                </h2>

                <p className="text-xl text-text-secondary max-w-lg leading-relaxed mb-10">
                  {t.watchDesc}
                </p>

                {/* Stats Row */}
                <div className="flex gap-8">
                  <div>
                    <div className="text-4xl font-bold text-text-primary">100+</div>
                    <div className="text-sm text-text-secondary">{t.stat1Label}</div>
                  </div>
                  <div className="w-px bg-border"></div>
                  <div>
                    <div className="text-4xl font-bold text-text-primary">4K</div>
                    <div className="text-sm text-text-secondary">{t.stat2Label}</div>
                  </div>
                  <div className="w-px bg-border"></div>
                  <div>
                    <div className="text-4xl font-bold text-text-primary">5</div>
                    <div className="text-sm text-text-secondary">{t.stat3Label}</div>
                  </div>
                </div>
              </div>

              {/* Right Column - Feature Stack */}
              <div className="lg:col-span-5 space-y-4 reveal-right delay-2">
                {[
                  { icon: Search, title: t.smartMatching, desc: t.smartMatchingDesc },
                  { icon: Play, title: t.stepByStep, desc: t.stepByStepDesc },
                  { icon: Shield, title: t.safetyFocused, desc: t.safetyFocusedDesc },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="group bg-surface/80 backdrop-blur-sm border border-border hover:border-info/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center flex-shrink-0 group-hover:bg-info/20 transition-colors">
                        <feature.icon className="w-6 h-6 text-info" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary mb-1">{feature.title}</h3>
                        <p className="text-sm text-text-secondary">{feature.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* CTA Button */}
                <button
                  onClick={() => navigate('/categories')}
                  className="w-full group flex items-center justify-between bg-info text-white rounded-2xl px-6 py-5 hover:bg-info-dark transition-all duration-300"
                >
                  <span className="font-semibold">{t.browseLibrary}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - Distinctive Bento Layout */}
      <section className="relative py-32">
        <div className="relative px-6 lg:px-12 xl:px-20">
          <div className="max-w-7xl mx-auto">
            {/* Section Header - Left aligned, editorial style */}
            <div className="mb-16 reveal-up">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-px bg-accent"></div>
                <span className="text-sm font-medium text-accent uppercase tracking-widest">{t.browseTopics}</span>
              </div>
              <div className="grid md:grid-cols-2 gap-8 items-end">
                <h2 className="text-5xl md:text-6xl font-bold text-text-primary leading-tight">
                  {t.skillsHeadline}
                  <span className="block text-text-muted">{t.modernFactory}</span>
                </h2>
                <p className="text-lg text-text-secondary md:text-right md:pb-2">
                  {t.skillsDesc}
                </p>
              </div>
            </div>

            {/* Asymmetrical Bento Grid */}
            <div className="grid grid-cols-12 gap-4 md:gap-6">
              {/* Factory Skills - Large Feature Card */}
              <button
                onClick={() => navigate('/categories')}
                className="group col-span-12 md:col-span-7 relative overflow-hidden rounded-3xl bg-surface border border-border hover:border-factory/30 transition-all duration-500 text-left reveal-up delay-1"
              >
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-factory/10 to-warning/5 rounded-full filter blur-3xl group-hover:blur-2xl transition-all duration-700 translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative p-8 md:p-12 min-h-[320px] flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="w-16 h-16 rounded-2xl bg-factory/10 border border-factory/20 flex items-center justify-center group-hover:bg-factory/20 transition-colors">
                      <Wrench className="w-8 h-8 text-factory" />
                    </div>
                    <span className="text-7xl font-bold text-text-primary/5 group-hover:text-factory/10 transition-colors">01</span>
                  </div>
                  <div>
                    <h3 className="text-3xl md:text-4xl font-bold text-text-primary mb-3 group-hover:text-factory transition-colors">{t.factorySkills}</h3>
                    <p className="text-text-secondary text-lg max-w-md">
                      {t.factorySkillsDesc}
                    </p>
                    <div className="mt-6 flex items-center gap-2 text-factory opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                      <span className="text-sm font-medium">{t.exploreSkills}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </button>

              {/* Safety Guide - Tall Card */}
              <button
                onClick={() => navigate('/categories')}
                className="group col-span-12 md:col-span-5 relative overflow-hidden rounded-3xl bg-surface border border-border hover:border-safety/30 transition-all duration-500 text-left reveal-up delay-2"
              >
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-safety/10 to-success/5 rounded-full filter blur-3xl group-hover:blur-2xl transition-all duration-700 -translate-x-1/2 translate-y-1/2"></div>
                <div className="relative p-8 md:p-10 min-h-[320px] flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-xl bg-safety/10 border border-safety/20 flex items-center justify-center group-hover:bg-safety/20 transition-colors">
                      <Shield className="w-7 h-7 text-safety" />
                    </div>
                    <span className="text-6xl font-bold text-text-primary/5 group-hover:text-safety/10 transition-colors">02</span>
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-3 group-hover:text-safety transition-colors">{t.safetyGuide}</h3>
                    <p className="text-text-secondary">
                      {t.safetyGuideDesc}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-safety opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm font-medium">{t.stayProtected}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </button>

              {/* Language - Horizontal Card */}
              <button
                onClick={() => navigate('/categories')}
                className="group col-span-12 md:col-span-5 relative overflow-hidden rounded-3xl bg-surface border border-border hover:border-language/30 transition-all duration-500 text-left reveal-up delay-3"
              >
                <div className="absolute top-1/2 right-0 w-48 h-48 bg-gradient-to-l from-language/10 to-info/5 rounded-full filter blur-3xl group-hover:blur-2xl transition-all duration-700 translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative p-8 md:p-10 min-h-[260px] flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="w-14 h-14 rounded-xl bg-language/10 border border-language/20 flex items-center justify-center group-hover:bg-language/20 transition-colors flex-shrink-0">
                    <Languages className="w-7 h-7 text-language" />
                  </div>
                  <div className="flex-1">
                    <span className="text-5xl font-bold text-text-primary/5 group-hover:text-language/10 transition-colors absolute top-6 right-6">03</span>
                    <h3 className="text-2xl font-bold text-text-primary mb-2 group-hover:text-language transition-colors">{t.language}</h3>
                    <p className="text-text-secondary text-sm">
                      {t.languageDesc}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-language opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm font-medium">{t.learnMore}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </button>

              {/* Health - Feature Card with Image Space */}
              <button
                onClick={() => navigate('/categories')}
                className="group col-span-12 md:col-span-7 relative overflow-hidden rounded-3xl bg-surface border border-border hover:border-health/30 transition-all duration-500 text-left reveal-up delay-4"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-health/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative p-8 md:p-10 min-h-[260px] flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-health/10 border border-health/20 flex items-center justify-center group-hover:bg-health/20 transition-colors">
                        <Heart className="w-6 h-6 text-health" />
                      </div>
                      <span className="text-5xl font-bold text-text-primary/5 group-hover:text-health/10 transition-colors">04</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-3 group-hover:text-health transition-colors">{t.healthWellness}</h3>
                    <p className="text-text-secondary mb-4">
                      {t.healthDesc}
                    </p>
                    <div className="flex items-center gap-2 text-health opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm font-medium">{t.prioritizeHealth}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                  {/* Decorative geometric element */}
                  <div className="hidden md:flex w-32 h-32 items-center justify-center">
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 border-2 border-health/20 rounded-full group-hover:scale-110 group-hover:border-health/40 transition-all duration-500"></div>
                      <div className="absolute inset-4 border border-health/10 rounded-full group-hover:scale-95 transition-all duration-500"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Heart className="w-8 h-8 text-health/40 group-hover:text-health/60 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Bottom Note */}
            <div className="mt-12 flex items-center justify-between border-t border-border pt-8">
              <p className="text-text-muted text-sm">
                {t.categoriesNote}
              </p>
              <button
                onClick={() => navigate('/categories')}
                className="group inline-flex items-center gap-3 px-6 py-3 bg-surface border border-border rounded-xl hover:border-accent transition-all"
              >
                <span className="font-medium text-text-primary">{t.viewAllCategories}</span>
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent transition-colors">
                  <ArrowRight className="w-4 h-4 text-accent group-hover:text-white transition-colors" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* dvb.png Feature Showcase */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/assets/dvb.png"
            alt="Advanced Factory Technology"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/90 to-bg-primary/70"></div>
        </div>

        <div className="relative px-6 lg:px-12 xl:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl reveal-left">
              <div className="inline-flex items-center gap-2 bg-surface-secondary rounded-full px-4 py-2 mb-6 border border-border">
                <Zap className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-text-secondary">{t.advancedLogistics}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
                {t.masterModern}
                <span className="block text-success">{t.factoryOps}</span>
              </h2>
              <p className="text-xl text-text-secondary mb-10 leading-relaxed">
                {t.factoryOpsDesc}
              </p>
              <div className="flex flex-wrap gap-4">
                {t.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-surface-secondary border border-border rounded-full text-sm text-text-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Videos Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/assets/dvb.png"
            alt=""
            className="w-full h-full object-cover opacity-10 dark:opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-bg-primary/98 to-bg-primary"></div>
        </div>

        <div className="relative px-6 lg:px-12 xl:px-20">
          <div className="max-w-7xl mx-auto">
            {/* Section Header with accent line */}
            <div className="flex items-center gap-4 mb-4 reveal-up">
              <div className="w-16 h-px bg-accent"></div>
              <span className="text-sm font-semibold text-accent uppercase tracking-widest">{t.videoLibraryLabel}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 reveal-up delay-1">
              <div>
                <h2 className="text-5xl md:text-6xl font-bold text-text-primary mb-4">{t.latestVideos}</h2>
                <p className="text-xl text-text-secondary max-w-xl">
                  {t.latestVideosDesc}
                </p>
              </div>
              <button
                onClick={() => navigate('/categories')}
                className="group inline-flex items-center gap-3 px-6 py-3 bg-surface border border-border rounded-xl hover:border-accent transition-all"
              >
                <span className="font-medium text-text-primary">{t.viewAllVideos}</span>
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent transition-colors">
                  <ArrowRight className="w-4 h-4 text-accent group-hover:text-white transition-colors" />
                </div>
              </button>
            </div>

            <VideoGrid videos={videos.slice(0, 4)} loading={loading} mobile2x2 />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-warning/10 to-info/10"></div>
        <div className="absolute inset-0 bg-bg-primary/80"></div>

        <div className="relative px-6 lg:px-12 xl:px-20">
          <div className="max-w-4xl mx-auto text-center reveal-scale">
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              {t.ctaHeadline}
            </h2>
            <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
              {t.ctaDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/chat')}
                className="group inline-flex items-center justify-center gap-3 bg-accent text-white px-10 py-5 rounded-xl font-semibold text-lg hover:bg-accent-dark transition-all duration-300 shadow-xl shadow-accent/25 hover:shadow-accent/35"
              >
                <Bot className="w-5 h-5" />
                {t.ctaChat}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center justify-center gap-2 bg-surface-secondary hover:bg-surface-hover text-text-primary px-10 py-5 rounded-xl font-medium text-lg border border-border hover:border-accent/30 transition-all duration-300"
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
