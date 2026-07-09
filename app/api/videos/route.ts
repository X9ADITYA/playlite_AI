import { NextResponse } from 'next/server';

import { connectDb } from '@/lib/db';
import { serializeVideo } from '@/lib/serializers';
import Video from '@/models/Video';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get('limit') ?? 24);

  await connectDb();
  const videos = await Video.find().sort({ createdAt: -1 }).limit(Number.isFinite(limit) ? limit : 24).lean();

  return NextResponse.json({ videos: videos.map((video) => serializeVideo(video as any)) });
}