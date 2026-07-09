import { NextResponse } from 'next/server';
import { z } from 'zod';

import { connectDb } from '@/lib/db';
import Video from '@/models/Video';
import { rankVideosForSearch } from '@/services/search';
import { serializeVideo } from '@/lib/serializers';

export const runtime = 'nodejs';

const schema = z.object({
  query: z.string().min(3)
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    await connectDb();

    const videos = await Video.find().sort({ createdAt: -1 }).limit(50).lean();
    const ranked = await rankVideosForSearch(videos as any, payload.query);

    return NextResponse.json({
      interpretation: ranked.interpretation,
      results: ranked.results.map((result) => ({
        video: serializeVideo(result.video as any),
        score: result.score,
        reason: result.reason
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Search failed' }, { status: 400 });
  }
}