import { NextResponse } from 'next/server';
import { z } from 'zod';

import { translateText } from '@/services/ai';

export const runtime = 'nodejs';

const schema = z.object({
  text: z.string().min(1),
  targetLanguage: z.string().min(2)
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    const translated = await translateText(payload.text, payload.targetLanguage);
    return NextResponse.json(translated);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Translation failed' }, { status: 400 });
  }
}