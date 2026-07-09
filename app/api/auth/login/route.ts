import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { connectDb } from '@/lib/db';
import { serializeUser } from '@/lib/serializers';
import { setAuthCookie, signAuthToken } from '@/lib/auth';
import User from '@/models/User';

export const runtime = 'nodejs';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    await connectDb();

    const user = await User.findOne({ email: payload.email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const passwordMatches = await bcrypt.compare(payload.password, user.passwordHash);
    if (!passwordMatches) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const response = NextResponse.json({ user: serializeUser(user.toObject()) });
    setAuthCookie(response, signAuthToken(String(user._id)));
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Login failed' }, { status: 400 });
  }
}