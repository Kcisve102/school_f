import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '../types';
import { videoService } from '../services/video.service';
import VideoGrid from '../components/video/VideoGrid';
import {
  FileText,
  Brain,
  ArrowRight,
  Sparkles,
  Code,
  Lightbulb,
  Globe,
  Briefcase,
  Palette,
  Dumbbell,
} from 'lucide-react';

export const CATEGORIES = [
  { id: 'factory skills', name: 'Factory Skills', icon: Code, color: 'from-blue-500 to-cyan-500' },
  { id: 'safety guide', name: 'Safety Guide', icon: Lightbulb, color: 'from-purple-500 to-pink-500' },
  { id: 'language', name: 'Language', icon: Globe, color: 'from-green-500 to-emerald-500' },
  { id: 'other', name: 'Other', icon: Briefcase, color: 'from-orange-500 to-red-500' },
  // { id: 'art', name: 'Art & Design', icon: Palette, color: 'from-pink-500 to-rose-500' },
  { id: 'health', name: 'Health', icon: Dumbbell, color: 'from-teal-500 to-cyan-500' },
];

export const HomePage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
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

  const features = [
    {
      icon: Brain,
      title: 'AI Transcription',
      description: 'Convert speech to text with timestamps automatically.',
    },
    {
      icon: FileText,
      title: 'Smart Summaries',
      description: 'Get key points extracted from your videos.',
    },
    {
      icon: Sparkles,
      title: 'Quiz Yourself',
      description: 'Test your understanding with generated questions.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a1f]">
      {/* Hero Section */}
      <section className="relative bg-[#0a0a1f] text-white overflow-hidden pt-20 pb-32">
        {/* Factory Background Image */}
        <div className="absolute inset-0">
          <img
            src="/assets/factory-hero-bg.jpg"
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&q=80';
            }}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1f]/95 via-[#0a0a1f]/85 to-[#0a0a1f]/95"></div>
          {/* Top gradient blend */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0a0a1f] to-transparent"></div>
          {/* Bottom gradient blend */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a1f] to-transparent"></div>
        </div>

        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/10">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-gray-300">AI-POWERED VIDEO LEARNING</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Video Learning,
              <span className="block bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                Reinvented
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              Experience a premium educational platform with AI-driven insights and sophisticated tools designed for deep focus and long-term retention.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/admin')}
                className="group bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-purple-500 hover:to-blue-500 transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center gap-2"
              >
                Start Learning Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Factory Background Image */}
        <div className="absolute inset-0">
          <img
            src="/assets/factory-features-bg.jpg"
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1920&q=80';
            }}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-[#0a0a1f]/92"></div>
          {/* Top gradient blend */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#0a0a1f] to-transparent"></div>
          {/* Bottom gradient blend */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a1f] to-transparent"></div>
        </div>

        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our Core Features
            </h2>
            <p className="text-lg text-gray-400">
              Designed for the modern learner who demands excellence and high-fidelity insights
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:border-purple-500/50"
              >
                <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 mb-6">
                  <feature.icon className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interface Preview Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Subtle factory background */}
        <div className="absolute inset-0">
          <img
            src="/assets/factory-interface-bg.jpg"
            alt=""
            className="w-full h-full object-cover opacity-30"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1920&q=80';
            }}
          />
          {/* Very dark overlay for subtle effect */}
          <div className="absolute inset-0 bg-[#0a0a1f]/95"></div>
          {/* Top gradient blend */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#0a0a1f] to-transparent"></div>
          {/* Bottom gradient blend */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a1f] to-transparent"></div>
        </div>

        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Experience the Interface
            </h2>
            <p className="text-lg text-gray-400">
              Our minimalistic dashboard is engineered for flow, helping you stay in the zone while you master complex topics
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/assets/video_player.png"
                alt="Interface Preview - Video Learning Dashboard"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Factory Skills Showcase Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Factory Background Image */}
        <div className="absolute inset-0">
          <img
            src="/assets/factory-skills-bg.jpg"
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=1920&q=80';
            }}
          />
          {/* Dark overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1f]/90 via-[#0f0f2e]/85 to-[#0a0a1f]/90"></div>
          {/* Top gradient blend */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#0a0a1f] to-transparent"></div>
          {/* Bottom gradient blend */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a1f] to-transparent"></div>
        </div>

        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-blue-500/30">
              <Code className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">FACTORY SKILLS</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Master Factory Skills
            </h2>
            <p className="text-lg text-gray-400">
              Learn essential manufacturing and industrial skills through comprehensive video tutorials
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Factory Image 1 */}
              <div className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-blue-500/50 transition-all duration-300">
                <div className="aspect-video overflow-hidden">
                  <img
                    src="/assets/factory-1.jpg"
                    alt="Factory Manufacturing Floor"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&q=80';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white">Manufacturing Operations</h3>
                  <p className="text-sm text-gray-400 mt-1">Learn production line operations and safety protocols</p>
                </div>
              </div>

              {/* Factory Image 2 */}
              <div className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-blue-500/50 transition-all duration-300">
                <div className="aspect-video overflow-hidden">
                  <img
                    src="/assets/factory-2.jpg"
                    alt="Industrial Equipment"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white">Equipment Handling</h3>
                  <p className="text-sm text-gray-400 mt-1">Master industrial equipment and machinery operation</p>
                </div>
              </div>

              {/* Factory Image 3 */}
              <div className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-blue-500/50 transition-all duration-300">
                <div className="aspect-video overflow-hidden">
                  <img
                    src="/assets/factory-3.jpg"
                    alt="Quality Control"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white">Quality Control</h3>
                  <p className="text-sm text-gray-400 mt-1">Understand quality assurance and inspection techniques</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => navigate('/categories')}
                className="group bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-500 hover:to-cyan-500 transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center gap-2 mx-auto"
              >
                Explore Factory Skills Videos
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-[#0a0a1f] border-t border-white/5">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Explore by Category
            </h2>
            <p className="text-lg text-gray-400">
              Browse videos organized by topic
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => navigate('/categories')}
                className="group relative overflow-hidden rounded-xl p-6 text-white transition-all hover:scale-105 hover:shadow-2xl w-40"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                <div className="relative z-10 flex flex-col items-center">
                  <category.icon className="w-8 h-8 mb-3" />
                  <h3 className="font-semibold text-sm md:text-base text-center">{category.name}</h3>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Videos Section */}
      {videos.length > 0 && (
        <section className="py-20 bg-[#0a0a1f]">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mb-12 max-w-3xl">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Latest Videos
              </h2>
              <p className="text-lg text-gray-400">
                Browse our collection of educational videos
              </p>
            </div>

            <VideoGrid videos={videos} loading={loading} />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Factory Background Image */}
        <div className="absolute inset-0">
          <img
            src="/assets/factory-cta-bg.jpg"
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1920&q=80';
            }}
          />
          {/* Gradient overlay for CTA */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 via-blue-600/85 to-cyan-600/90"></div>
          {/* Top gradient blend */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#0a0a1f] to-transparent"></div>
        </div>

        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to elevate your learning?
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join thousands of students and professionals who have unlocked a more effective way to learn from video content
            </p>
            <button
              onClick={() => navigate('/admin')}
              className="bg-white text-purple-600 px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-200 shadow-xl hover:shadow-2xl"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
