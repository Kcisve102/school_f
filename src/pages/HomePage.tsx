import React, { useEffect, useState } from 'react';
import { Video } from '../types';
import { videoService } from '../services/video.service';
import VideoGrid from '../components/video/VideoGrid';

export const HomePage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Educational Videos</h1>
        <p className="text-gray-600">
          Browse our collection of educational videos with AI-powered transcriptions and summaries
        </p>
      </div>

      <VideoGrid videos={videos} loading={loading} />
    </div>
  );
};

export default HomePage;
