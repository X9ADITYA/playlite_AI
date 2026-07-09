import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { connectDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { serializeVideo } from '@/lib/serializers';
import Video from '@/models/Video';
import WatchEvent from '@/models/WatchEvent';
import User from '@/models/User';
import { buildRecommendations } from '@/services/recommendations';
import { VideoDetailClient } from '@/components/video-detail-client';

export const dynamic = 'force-dynamic';

async function loadVideo(id: string) {
  await connectDb();
  const video = await Video.findById(id).lean();

  if (!video) {
    notFound();
  }

  const user = (await getCurrentUser()) || null;
  const latestVideos = await Video.find({ _id: { $ne: id } }).sort({ createdAt: -1 }).limit(12).lean();
  const watchHistory = user ? await WatchEvent.find({ userId: user.id }).populate('videoId').sort({ updatedAt: -1 }).limit(24).lean() : [];
  const currentUser = user ? await User.findById(user.id).lean() : null;

  const related = buildRecommendations({
    videos: latestVideos as any,
    user: currentUser as any,
    watchHistory: watchHistory
      .map((event) => ({
        ...event,
        video: (event as any).videoId ?? null
      })) as any,
    limit: 6
  });

  return {
    video: serializeVideo(video as any),
    related: related.map((item) => serializeVideo(item.video as any))
  };
}

export default async function VideoPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const data = await loadVideo(id);
  const user = await getCurrentUser();

  return (
    <AppShell user={user}>
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
      <VideoDetailClient video={data.video} relatedVideos={data.related} />
    </AppShell>
  );
}