import { forwardRef, useImperativeHandle, useRef } from 'react';
import ReactPlayer from 'react-player';

export interface VideoPlayerHandle {
  seekTo: (seconds: number) => void;
}

interface VideoPlayerProps {
  url: string;
  onProgress?: (played: number) => void;
  onEnded?: () => void;
  onError?: () => void;
  onReady?: () => void;
}

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  ({ url, onProgress, onEnded, onError, onReady }, ref) => {
    const playerRef = useRef<ReactPlayer>(null);

    // Expose seeking to the parent so playback can resume after the presigned
    // URL is refreshed (and so transcript segments could drive the player).
    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        playerRef.current?.seekTo(seconds, 'seconds');
      },
    }));

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
          onError={onError}
          onReady={onReady}
          progressInterval={1000}
          config={{
            file: {
              attributes: {},
            },
          }}
        />
      </div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
