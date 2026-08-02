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

    /*
      Full page width at 16:9, with no pillarboxing.

      The frame takes the container's full width and derives its height from the
      aspect ratio. A `max-h` cap alongside `aspect-video` was tried and removed:
      once the cap binds, the box stays wider than the video and black bars
      appear down both sides. Capping the width instead avoids the bars but
      stops the player short of the page edge, which is the thing this layout
      is for. So width wins and the height follows it.
    */
    return (
      <div className="relative bg-black overflow-hidden w-full aspect-video">
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
