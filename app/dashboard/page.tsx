import Link from 'next/link';
import { BarChart3, Bot, PlayCircle, Upload } from 'lucide-react';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SearchPanel } from '@/components/search-panel';
import { UploadVideoForm } from '@/components/upload-video-form';
import { VideoCard } from '@/components/video-card';
import { connectDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { serializeRecommendation, serializeVideo } from '@/lib/serializers';
import User from '@/models/User';
import Video from '@/models/Video';
import WatchEvent from '@/models/WatchEvent';
import { buildRecommendations } from '@/services/recommendations';

export const dynamic = 'force-dynamic';

async function loadDashboardData() {
  await connectDb();
  const user = (await getCurrentUser()) || null;
  const latestVideos = await Video.find().sort({ createdAt: -1 }).limit(12).lean();
  const watchHistory = user
    ? await WatchEvent.find({ userId: user.id }).populate('videoId').sort({ updatedAt: -1 }).limit(24).lean()
    : [];

  const hydratedWatchHistory = watchHistory.map((event) => ({
    ...event,
    video: (event as any).videoId ?? null
  }));

  const currentUser = user ? await User.findById(user.id).lean() : null;
  const recommendations = buildRecommendations({
    videos: latestVideos as any,
    user: currentUser as any,
    watchHistory: hydratedWatchHistory as any,
    limit: 8
  });

  return {
    user,
    latestVideos: latestVideos.map((video) => serializeVideo(video as any)),
    recommendations: recommendations.map(serializeRecommendation)
  };
}

export default async function DashboardPage() {
  const { user, latestVideos, recommendations } = await loadDashboardData();

  return (
    <AppShell user={user}>
      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="glass-panel border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">Overview</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Your AI video learning workspace.</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Upload a video, let PlayLite extract transcripts and summaries, then ask questions and build a personalized learning feed.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Upload, label: 'Upload', value: 'Video ingestion' },
              { icon: Bot, label: 'Ask', value: 'Transcript Q&A' },
              { icon: BarChart3, label: 'Learn', value: 'Recommendations' }
            ].map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Icon className="h-5 w-5 text-cyan-300" />
                  <p className="mt-3 text-xs uppercase tracking-[0.28em] text-slate-500">{metric.label}</p>
                  <p className="mt-1 font-semibold text-white">{metric.value}</p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="glass-panel border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Quick actions</p>
          <div className="mt-4 grid gap-3">
            <Button asChild className="justify-start">
              <Link href="#upload">Upload a new video</Link>
            </Button>
            <Button variant="secondary" asChild className="justify-start">
              <Link href="#search">Search your library conversationally</Link>
            </Button>
            <Button variant="ghost" asChild className="justify-start">
              <Link href="#recommendations">Open personalized recommendations</Link>
            </Button>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <UploadVideoForm />
        <SearchPanel />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]" id="recommendations">
        <Card className="glass-panel border-white/10 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Library</p>
              <h2 className="text-2xl font-semibold">Latest uploads</h2>
            </div>
            <PlayCircle className="h-6 w-6 text-cyan-300" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {latestVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </Card>

        <Card className="glass-panel border-white/10 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Personalized</p>
              <h2 className="text-2xl font-semibold">Smart recommendations</h2>
            </div>
            <Button variant="secondary" asChild>
              <Link href="/api/recommendations">Refresh</Link>
            </Button>
          </div>

          <div className="grid gap-4">
            {recommendations.map((result) => (
              <VideoCard key={result.id} video={result} score={result.score} reason={result.reason} />
            ))}
          </div>
        </Card>
      </section>
    </AppShell>
  );
}