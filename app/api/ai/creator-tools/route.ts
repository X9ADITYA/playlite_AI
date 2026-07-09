import { NextResponse } from 'next/server';
import { z } from 'zod';

import { generateCreatorCopy } from '@/services/ai';

export const runtime = 'nodejs';

const schema = z.object({
  title: z.string().min(2),
  transcript: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    const creatorCopy = await generateCreatorCopy(payload.title, payload.transcript);
    return NextResponse.json({ creatorCopy });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Creator tools failed' }, { status: 400 });
  }
}