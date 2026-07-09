import { NextResponse } from 'next/server';
import { z } from 'zod';

import { connectDb } from '@/lib/db';
import Video from '@/models/Video';
import { generateLearningPack } from '@/services/ai';

export const runtime = 'nodejs';

const schema = z.object({
  videoId: z.string()
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    await connectDb();

    const video = await Video.findById(payload.videoId);
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const learning = await generateLearningPack(video.title, video.transcript || '');
    video.learning = learning;
    await video.save();

    return NextResponse.json({ learning });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Learning generation failed' }, { status: 400 });
  }
}