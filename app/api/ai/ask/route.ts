import { NextResponse } from 'next/server';
import { z } from 'zod';

import { connectDb } from '@/lib/db';
import Video from '@/models/Video';
import { answerVideoQuestion } from '@/services/ai';

export const runtime = 'nodejs';

const schema = z.object({
  videoId: z.string(),
  question: z.string().min(3),
  transcript: z.string().optional().default(''),
  timestamps: z.array(z.object({ label: z.string(), time: z.string(), note: z.string() })).optional().default([])
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    await connectDb();

    const video = await Video.findById(payload.videoId);
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const transcript = video.transcript || payload.transcript;
    const answer = await answerVideoQuestion(video.title, transcript, payload.question, payload.timestamps.length > 0 ? payload.timestamps : video.summary?.keyTimestamps ?? []);

    return NextResponse.json(answer);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Ask failed' }, { status: 400 });
  }
}