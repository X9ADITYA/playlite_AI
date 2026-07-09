import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { connectDb } from '@/lib/db';
import { serializeUser } from '@/lib/serializers';
import { setAuthCookie, signAuthToken } from '@/lib/auth';
import User from '@/models/User';

export const runtime = 'nodejs';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  topics: z.array(z.string()).default([]),
  languages: z.array(z.string()).default(['en']),
  learningGoals: z.array(z.string()).default([]),
  maxVideoDurationMinutes: z.number().optional()
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    await connectDb();

    const existingUser = await User.findOne({ email: payload.email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);
    const user = await User.create({
      name: payload.name,
      email: payload.email.toLowerCase(),
      passwordHash,
      preferences: {
        topics: payload.topics,
        languages: payload.languages.length > 0 ? payload.languages : ['en'],
        learningGoals: payload.learningGoals,
        maxVideoDurationMinutes: payload.maxVideoDurationMinutes
      }
    });

    const response = NextResponse.json({ user: serializeUser(user.toObject()) }, { status: 201 });
    setAuthCookie(response, signAuthToken(String(user._id)));
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Signup failed' }, { status: 400 });
  }
}