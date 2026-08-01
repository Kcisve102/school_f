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
      <div className="py-16 max-w-[46ch]">
        <h3 className="font-display font-medium text-text-primary text-xl tracking-[-0.02em] mb-3">
          No videos available
        </h3>
        <p className="text-text-secondary leading-relaxed">
          Upload your first video to get started.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid gap-x-5 gap-y-8 lg:gap-x-6 lg:gap-y-10 ${mobile2x2 ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
      {videos.map((video, index) => (
        <div key={video.id} className={`flex ${mobile2x2 && index === 3 ? 'lg:hidden' : ''}`}>
          <VideoCard video={video} compact={mobile2x2} index={index} />
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
