import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth';
import { safeRemoveFile, writeUploadToTempFile } from '@/lib/files';
import { connectDb } from '@/lib/db';
import { serializeVideo } from '@/lib/serializers';
import Video from '@/models/Video';
import { uploadVideoFile } from '@/services/storage';
import { extractTranscriptFromMediaFile } from '@/services/transcription';
import { generateCreatorCopy, generateLearningPack, generateVideoSummary } from '@/services/ai';

export const runtime = 'nodejs';

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  tags: z.string().optional().default(''),
  language: z.string().optional().default('en')
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Video file is required' }, { status: 400 });
    }

    const parsedPayload = schema.safeParse({
      title: String(formData.get('title') ?? ''),
      description: String(formData.get('description') ?? ''),
      tags: String(formData.get('tags') ?? ''),
      language: String(formData.get('language') ?? 'en')
    });

    if (!parsedPayload.success) {
      return NextResponse.json(
        {
          error: parsedPayload.error.issues[0]?.message || 'Invalid upload payload'
        },
        { status: 400 }
      );
    }

    const payload = parsedPayload.data;

    const tempPath = await writeUploadToTempFile(file);
    await connectDb();

    try {
      const [storage, transcript] = await Promise.all([
        uploadVideoFile(tempPath, file.name),
        extractTranscriptFromMediaFile(tempPath, file.type)
      ]);
      const [summary, learning, creatorCopy] = await Promise.all([
        generateVideoSummary(payload.title, transcript),
        generateLearningPack(payload.title, transcript),
        generateCreatorCopy(payload.title, transcript)
      ]);

      const video = await Video.create({
        creatorId: user.id,
        title: payload.title,
        description: payload.description,
        tags: payload.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        language: payload.language || 'en',
        videoUrl: storage.videoUrl,
        thumbnailUrl: storage.thumbnailUrl,
        storageProvider: storage.storageProvider,
        storageKey: storage.storageKey,
        durationSeconds: 0,
        transcript,
        summary,
        learning,
        creatorCopy,
        viewCount: 0
      });

      return NextResponse.json({ video: serializeVideo(video.toObject()) }, { status: 201 });
    } finally {
      await safeRemoveFile(tempPath);
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Upload failed' }, { status: 400 });
  }
}