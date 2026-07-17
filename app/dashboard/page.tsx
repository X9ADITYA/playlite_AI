import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart3, Bot, Lightbulb, Upload } from 'lucide-react';

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
import type { LeanVideoDocument, LeanUserDocument, LeanWatchEventDocument } from '@/types/models';

export const dynamic = 'force-dynamic';

async function loadLatestVideos() {
  const videos = await Video.find().sort({ createdAt: -1 }).limit(12).lean<LeanVideoDocument[]>();
  return videos.map((video) => serializeVideo(video));
}

async function loadUserContext() {
  const user = (await getCurrentUser()) || null;
  if (!user) {
    return { user: null, currentUser: null, watchHistory: [] as LeanWatchEventDocument[] };
  }

  const [currentUser, watchHistory] = await Promise.all([
    User.findById(user.id).lean<LeanUserDocument | null>(),
    WatchEvent.find({ userId: user.id })
      .populate('videoId')
      .sort({ updatedAt: -1 })
      .limit(24)
      .lean<LeanWatchEventDocument[]>()
  ]);

  const hydratedWatchHistory = watchHistory.map((event) => ({
    ...event,
    video: event.videoId ?? null
  }));

  return { user, currentUser, watchHistory: hydratedWatchHistory };
}

async function LatestVideosSection() {
  let videos: ReturnType<typeof serializeVideo>[] = [];
  let failed = false;

  try {
    videos = await loadLatestVideos();
  } catch (error) {
    console.error('Failed to load latest videos', error);
    failed = true;
  }

  return (
    <Card className="glass-panel border-white/10 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Library</p>
          <h2 className="text-2xl font-semibold">Latest uploads</h2>
        </div>
        <Link href="/videos" className="flex items-center gap-1 text-sm font-medium text-cyan-300 hover:text-cyan-200">
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {failed ? (
        <p className="text-sm text-slate-400">Couldn't load your library right now. Try refreshing.</p>
      ) : videos.length === 0 ? (
        <p className="text-sm text-slate-400">No uploads yet — add your first video to get started.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </Card>
  );
}

async function RecommendationsSection() {
  let recommendations: ReturnType<typeof serializeRecommendation>[] = [];
  let failed = false;

  try {
    const [videos, { currentUser, watchHistory }] = await Promise.all([
      Video.find().sort({ createdAt: -1 }).limit(12).lean<LeanVideoDocument[]>(),
      loadUserContext()
    ]);

    const built = buildRecommendations({
      videos,
      user: currentUser,
      watchHistory,
      limit: 8
    });
    recommendations = built.map(serializeRecommendation);
  } catch (error) {
    console.error('Failed to build recommendations', error);
    failed = true;
  }

  return (
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

      {failed ? (
        <p className="text-sm text-slate-400">Recommendations are temporarily unavailable.</p>
      ) : recommendations.length === 0 ? (
        <p className="text-sm text-slate-400">Watch a few videos to unlock personalized picks.</p>
      ) : (
        <div className="grid gap-4">
          {recommendations.map((result) => (
            <VideoCard key={result.id} video={result} score={result.score} reason={result.reason} />
          ))}
        </div>
      )}
    </Card>
  );
}

function SectionSkeleton({ label }: { label: string }) {
  return (
    <Card className="glass-panel border-white/10 p-6">
      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
    </Card>
  );
}

const quickActions = [
  {
    href: '#upload',
    icon: Upload,
    label: 'Upload a new video',
    description: 'Ingest a video and generate AI insights',
    primary: true
  },
  {
    href: '#search',
    icon: Bot,
    label: 'Search your library',
    description: 'Ask conversationally, get ranked results',
    primary: false
  },
  {
    href: '#recommendations',
    icon: BarChart3,
    label: 'Personalized recommendations',
    description: 'Picks based on your watch history',
    primary: false
  }
];

export default async function DashboardPage() {
  await connectDb();
  const user = (await getCurrentUser()) || null;

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
                  <Icon className="h-5 w-5 text-cyan-300" aria-hidden="true" />
                  <p className="mt-3 text-xs uppercase tracking-[0.28em] text-slate-500">{metric.label}</p>
                  <p className="mt-1 font-semibold text-white">{metric.value}</p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="glass-panel flex flex-col border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Quick actions</p>
          <div className="mt-4 space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={
                    action.primary
                      ? 'flex items-center gap-3 rounded-2xl bg-cyan-400 px-4 py-3 text-slate-950 transition hover:bg-cyan-300'
                      : 'flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-cyan-300/30 hover:bg-white/8'
                  }
                >
                  <div
                    className={
                      action.primary
                        ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950/10'
                        : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300'
                    }
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className={action.primary ? 'font-semibold text-slate-950' : 'font-semibold text-white'}>
                      {action.label}
                    </p>
                    <p className={action.primary ? 'text-xs text-slate-950/70' : 'text-xs text-slate-400'}>
                      {action.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-auto pt-6">
            <div className="flex gap-3 rounded-2xl border border-dashed border-white/10 bg-white/5 p-4">
              <Lightbulb className="h-4 w-4 shrink-0 text-cyan-300" />
              <p className="text-xs leading-5 text-slate-400">
                Tip: the more videos you watch, the better your recommendations get — PlayLite learns from your topics and watch history.
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <UploadVideoForm />
        <SearchPanel />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]" id="recommendations">
        <Suspense fallback={<SectionSkeleton label="Library" />}>
          <LatestVideosSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton label="Personalized" />}>
          <RecommendationsSection />
        </Suspense>
      </section>
    </AppShell>
  );
}