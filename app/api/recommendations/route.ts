import { NextResponse } from 'next/server';

import { connectDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { serializeRecommendation } from '@/lib/serializers';
import User from '@/models/User';
import Video from '@/models/Video';
import WatchEvent from '@/models/WatchEvent';
import { buildRecommendations } from '@/services/recommendations';

export const runtime = 'nodejs';

export async function GET() {
  await connectDb();
  const user = (await getCurrentUser()) || null;
  const videos = await Video.find().sort({ createdAt: -1 }).limit(30).lean();
  const watchHistory = user ? await WatchEvent.find({ userId: user.id }).populate('videoId').sort({ updatedAt: -1 }).limit(24).lean() : [];
  const currentUser = user ? await User.findById(user.id).lean() : null;

  const recommendations = buildRecommendations({
    videos: videos as any,
    user: currentUser as any,
    watchHistory: watchHistory
      .map((event) => ({
        ...event,
        video: (event as any).videoId ?? null
      })) as any,
    limit: 8
  });

  return NextResponse.json({ recommendations: recommendations.map(serializeRecommendation) });
}