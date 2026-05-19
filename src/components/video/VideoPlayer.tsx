import React, { useRef } from 'react';
import ReactPlayer from 'react-player';

interface VideoPlayerProps {
  url: string;
  onProgress?: (played: number) => void;
  onEnded?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, onProgress, onEnded }) => {
  const playerRef = useRef<ReactPlayer>(null);

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    if (onProgress) {
      onProgress(state.playedSeconds);
    }
  };

  const handleEnded = () => {
    if (onEnded) {
      onEnded();
    }
  };

  return (
    <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingTop: '56.25%' }}>
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0 }}
        controls
        onProgress={handleProgress}
        onEnded={handleEnded}
        progressInterval={1000}
        config={{
          file: {
            attributes: {
              crossOrigin: 'anonymous'
            }
          }
        }}
      />
    </div>
  );
};

export default VideoPlayer;
