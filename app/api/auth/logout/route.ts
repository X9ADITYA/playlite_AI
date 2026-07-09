import { NextResponse } from 'next/server';

import { clearAuthCookie } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST() {
  const response = NextResponse.redirect(new URL('/login', process.env.APP_URL || 'http://localhost:3000'));
  clearAuthCookie(response);
  return response;
}