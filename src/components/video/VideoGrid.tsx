import React from 'react';
import { Video } from '../../types';
import VideoCard from './VideoCard';
import Loader from '../common/Loader';

interface VideoGridProps {
  videos: Video[];
  loading?: boolean;
  mobile2x2?: boolean;
}

export const VideoGrid: React.FC<VideoGridProps> = ({ videos, loading, mobile2x2 }) => {
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
    <div className={`grid gap-3 ${mobile2x2 ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
      {videos.map((video, index) => (
        <div key={video.id} className={`flex ${mobile2x2 && index === 3 ? 'lg:hidden' : ''}`}>
          <VideoCard video={video} compact={mobile2x2} />
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
