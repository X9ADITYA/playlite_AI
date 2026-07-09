import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

export async function writeUploadToTempFile(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const extension = path.extname(file.name) || guessExtension(file.type);
  const tempPath = path.join(os.tmpdir(), `${randomUUID()}${extension}`);

  await fs.writeFile(tempPath, buffer);
  return tempPath;
}

export async function safeRemoveFile(filePath: string) {
  try {
    await fs.unlink(filePath);
  } catch {
    // Ignore cleanup failures.
  }
}

function guessExtension(mimeType?: string) {
  switch (mimeType) {
    case 'video/mp4':
      return '.mp4';
    case 'video/webm':
      return '.webm';
    case 'audio/mpeg':
      return '.mp3';
    case 'audio/wav':
      return '.wav';
    default:
      return '.bin';
  }
}