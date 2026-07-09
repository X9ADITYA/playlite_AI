import Link from 'next/link';
import { Clock3, Play } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { clampText, formatDuration, formatTimestamp } from '@/lib/utils';

export function VideoCard({
  video,
  score,
  reason
}: Readonly<{
  video: {
    id: string;
    title: string;
    description: string;
    tags: string[];
    thumbnailUrl?: string | null;
    durationSeconds: number;
    viewCount?: number;
    createdAt?: string | null;
  };
  score?: number;
  reason?: string;
}>) {
  return (
    <Card className="group overflow-hidden border-white/10 bg-slate-950/50 transition hover:-translate-y-1 hover:border-cyan-300/25">
      <Link href={`/videos/${video.id}`} className="block">
        <div className="relative aspect-video overflow-hidden bg-slate-900">
          <img
            src={video.thumbnailUrl || '/video-thumb.svg'}
            alt={video.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur">
            <Play className="h-3.5 w-3.5 fill-white" />
            {formatDuration(video.durationSeconds)}
          </div>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="font-semibold leading-6 text-white">{clampText(video.title, 56)}</h3>
              <p className="text-sm leading-6 text-slate-400">{clampText(video.description, 96)}</p>
            </div>
            {typeof score === 'number' ? (
              <Badge className="shrink-0 border-cyan-300/20 bg-cyan-400/10 text-cyan-100">{score.toFixed(1)}</Badge>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {video.tags.slice(0, 3).map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Clock3 className="h-3.5 w-3.5" />
              {formatTimestamp(video.createdAt ?? null)}
            </div>
            <span>{video.viewCount ?? 0} views</span>
          </div>

          {reason ? <p className="text-xs leading-5 text-cyan-100/80">{reason}</p> : null}
        </div>
      </Link>
    </Card>
  );
}