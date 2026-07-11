"use client";

import { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function VideoPlayer({
  video,
  onProgress
}: Readonly<{
  video: { id: string; title: string; videoUrl: string; thumbnailUrl?: string | null };
  onProgress?: (seconds: number, completed: boolean) => Promise<void> | void;
}>) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastSentRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const media = videoRef.current;
    if (!media) {
      return undefined;
    }

    const sendProgress = async (completed = false) => {
      if (!onProgress) {
        return;
      }

      const currentSeconds = Math.floor(media.currentTime);
      if (!completed && currentSeconds - lastSentRef.current < 15) {
        return;
      }

      lastSentRef.current = currentSeconds;
      await onProgress(currentSeconds, completed);
    };

    const onTimeUpdate = () => {
      void sendProgress(false);
    };

    const onPlay = () => {
      setPlaying(true);
      setHasStarted(true);
    };
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      void sendProgress(true);
    };

    media.addEventListener('timeupdate', onTimeUpdate);
    media.addEventListener('play', onPlay);
    media.addEventListener('pause', onPause);
    media.addEventListener('ended', onEnded);

    return () => {
      media.removeEventListener('timeupdate', onTimeUpdate);
      media.removeEventListener('play', onPlay);
      media.removeEventListener('pause', onPause);
      media.removeEventListener('ended', onEnded);
    };
  }, [onProgress]);

  const showOverlay = !hasStarted && !playing;

  return (
    <div className="space-y-4">
      <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-glow">
        <video
          ref={videoRef}
          className="aspect-video w-full bg-black"
          controls
          poster={video.thumbnailUrl ?? '/video-thumb.svg'}
        >
          <source src={video.videoUrl} />
        </video>
        {showOverlay ? (
          <button
            type="button"
            onClick={() => videoRef.current?.play()}
            aria-label={`Play ${video.title}`}
            className="absolute inset-0 flex items-center justify-center bg-black/25 transition hover:bg-black/35"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition group-hover:scale-105">
              <Play className="h-8 w-8 fill-white" />
            </div>
          </button>
        ) : null}
      </div>

      <Button variant="secondary" className="w-full" onClick={() => videoRef.current?.requestFullscreen()}>
        Fullscreen
      </Button>
    </div>
  );
}