import { NextResponse } from 'next/server';
import { z } from 'zod';

import { connectDb } from '@/lib/db';
import { serializeVideo } from '@/lib/serializers';
import Video from '@/models/Video';
import { generateVideoSummary } from '@/services/ai';

export const runtime = 'nodejs';

const schema = z.object({
  videoId: z.string().optional(),
  title: z.string().optional(),
  transcript: z.string().optional().default('')
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    await connectDb();

    let title = payload.title ?? 'Untitled video';
    let transcript = payload.transcript;
    let video = null;

    if (payload.videoId) {
      video = await Video.findById(payload.videoId);
      if (!video) {
        return NextResponse.json({ error: 'Video not found' }, { status: 404 });
      }

      title = video.title;
      transcript = video.transcript ?? transcript;
    }

    const summary = await generateVideoSummary(title, transcript);

    if (video) {
      video.summary = summary;
      await video.save();
    }

    return NextResponse.json({ summary, video: video ? serializeVideo(video.toObject()) : null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Summarization failed' }, { status: 400 });
  }
}