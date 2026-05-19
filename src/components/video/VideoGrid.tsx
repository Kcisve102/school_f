import React from 'react';
import { Video } from '../../types';
import VideoCard from './VideoCard';
import Loader from '../common/Loader';

interface VideoGridProps {
  videos: Video[];
  loading?: boolean;
}

export const VideoGrid: React.FC<VideoGridProps> = ({ videos, loading }) => {
  if (loading) {
    return <Loader text="Loading videos..." />;
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No videos available</p>
        <p className="text-gray-400 text-sm mt-2">
          Upload your first video to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
};

export default VideoGrid;
