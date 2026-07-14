import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth';
import { connectDb } from '@/lib/db';
import User from '@/models/User';
import { serializeUser } from '@/lib/serializers';

export const runtime = 'nodejs';

const schema = z.object({
  name: z.string().min(1).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  preferences: z
    .object({
      topics: z.array(z.string()).optional(),
      languages: z.array(z.string()).optional(),
      learningGoals: z.array(z.string()).optional(),
      maxVideoDurationMinutes: z.number().min(1).max(180).optional()
    })
    .optional()
});

export async function PATCH(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const payload = schema.parse(await request.json());

  await connectDb();
  const user = await User.findById(currentUser.id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (payload.name !== undefined) user.name = payload.name;
  if (payload.avatarUrl !== undefined) user.avatarUrl = payload.avatarUrl;

  if (payload.preferences) {
    user.preferences = {
      topics: payload.preferences.topics ?? user.preferences.topics,
      languages: payload.preferences.languages ?? user.preferences.languages,
      learningGoals: payload.preferences.learningGoals ?? user.preferences.learningGoals,
      maxVideoDurationMinutes: payload.preferences.maxVideoDurationMinutes ?? user.preferences.maxVideoDurationMinutes
    };
  }

  await user.save();

  return NextResponse.json({ user: serializeUser(user as any) });
}