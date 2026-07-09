import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

import ffmpegPath from 'ffmpeg-static';
import OpenAI from 'openai';

const execFileAsync = promisify(execFile);

function resolveFfmpegPath() {
  const envPath = process.env.FFMPEG_PATH?.trim();

  if (envPath) {
    return envPath;
  }

  return ffmpegPath ?? null;
}

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1'
    })
  : null;

async function extractAudioTrack(videoPath: string) {
  const resolvedFfmpegPath = resolveFfmpegPath();

  if (!resolvedFfmpegPath) {
    return videoPath;
  }

  const audioPath = path.join(path.dirname(videoPath), `${path.parse(videoPath).name}-audio.mp3`);
  await execFileAsync(resolvedFfmpegPath, ['-y', '-i', videoPath, '-vn', '-ac', '1', '-ar', '16000', '-b:a', '64k', audioPath]);
  return audioPath;
}

async function transcribeFile(filePath: string) {
  if (!openai) {
    return `Transcript not available yet. Upload the video with OPENAI_API_KEY configured to generate a live transcript. File context: ${path.basename(filePath)}.`;
  }

  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: 'whisper-1'
  });

  return transcription.text;
}

export async function extractTranscriptFromMediaFile(mediaPath: string, mimeType?: string) {
  const isVideo = Boolean(mimeType?.startsWith('video/'));

  if (!isVideo) {
    return transcribeFile(mediaPath);
  }

  let audioPath = mediaPath;
  try {
    audioPath = await extractAudioTrack(mediaPath);
    return await transcribeFile(audioPath);
  } finally {
    if (audioPath !== mediaPath) {
      await fsPromises.unlink(audioPath).catch(() => undefined);
    }
  }
}