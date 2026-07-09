import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth';
import { connectDb } from '@/lib/db';
import Video from '@/models/Video';
import WatchEvent from '@/models/WatchEvent';

export const runtime = 'nodejs';

const schema = z.object({
  watchedSeconds: z.number().min(0).default(0),
  completed: z.boolean().default(false)
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { id } = await params;
  const payload = schema.parse(await request.json());

  await connectDb();
  const video = await Video.findById(id);
  if (!video) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }

  await WatchEvent.findOneAndUpdate(
    { userId: user.id, videoId: id },
    {
      $set: {
        watchedSeconds: payload.watchedSeconds,
        lastPosition: payload.watchedSeconds,
        completed: payload.completed
      }
    },
    { upsert: true, new: true }
  );

  if (payload.completed) {
    video.viewCount = (video.viewCount ?? 0) + 1;
    await video.save();
  }

  return NextResponse.json({ ok: true });
}