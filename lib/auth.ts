import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { connectDb } from '@/lib/db';
import User, { type UserRecord } from '@/models/User';
import { serializeUser } from '@/lib/serializers';

export const AUTH_COOKIE_NAME = 'playlite_token';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }

  return secret;
}

export function signAuthToken(userId: string) {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as { userId: string };
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0)
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  try {
    const payload = verifyAuthToken(token);
    await connectDb();
    const user = await User.findById(payload.userId).select('-passwordHash');

    if (!user) {
      return null;
    }

    return serializeUser(user as any);
  } catch {
    return null;
  }
}