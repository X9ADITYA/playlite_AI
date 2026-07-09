import { NextResponse } from 'next/server';

import { connectDb } from '@/lib/db';
import { serializeVideo } from '@/lib/serializers';
import Video from '@/models/Video';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDb();
  const video = await Video.findById(id).lean();

  if (!video) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }

  return NextResponse.json({ video: serializeVideo(video as any) });
}