import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth';
import { connectDb } from '@/lib/db';
import User from '@/models/User';

export const runtime = 'nodejs';

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8)
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

  const matches = await bcrypt.compare(payload.currentPassword, user.passwordHash);
  if (!matches) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
  }

  user.passwordHash = await bcrypt.hash(payload.newPassword, 10);
  await user.save();

  return NextResponse.json({ ok: true });
}