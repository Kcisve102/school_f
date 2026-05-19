import React, { useEffect, useState } from 'react';
import { Video } from '../types';
import { videoService } from '../services/video.service';
import VideoCard from '../components/video/VideoCard';
import { CATEGORIES } from '../constants/categories';

export const CategoriesPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');

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

  return (
    <div className="flex min-h-screen bg-[#0a0a1f] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f0f23] border-r border-white/10 p-6 fixed h-full">
        <h2 className="text-2xl font-bold text-white mb-6">Categories</h2>

        <nav className="space-y-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`w-full px-4 py-3 rounded-lg transition-all font-medium text-left ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            All Categories
          </button>

          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full px-4 py-3 rounded-lg transition-all font-medium text-left ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {category}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 ml-64">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
          </h1>
          <p className="text-gray-400">
            {selectedCategory === 'all'
              ? `Explore all ${videos.length} educational videos`
              : `Explore ${videos.length} videos in ${selectedCategory}`
            }
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <p className="text-gray-400 text-lg">No videos available</p>
            <p className="text-gray-500 text-sm mt-2">
              Upload your first video to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoriesPage;
