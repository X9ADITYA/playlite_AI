"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BrainCircuit, ClipboardCopy, Clock3, Sparkles } from 'lucide-react';

import { AskVideoForm } from '@/components/ask-video-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { VideoPlayer } from '@/components/video-player';
import { clampText, formatDuration } from '@/lib/utils';

export function VideoDetailClient({
  video,
  relatedVideos
}: Readonly<{
  video: {
    id: string;
    title: string;
    description: string;
    tags: string[];
    videoUrl: string;
    thumbnailUrl?: string | null;
    durationSeconds: number;
    transcript: string;
    shortSummary: string;
    bulletPoints: string[];
    keyTimestamps: Array<{ label: string; time: string; note: string }>;
    notes: string[];
    quizQuestions: Array<{ question: string; options: string[]; answer: string }>;
    creatorCopy?: { title: string; description: string; thumbnailPrompt: string } | null;
  };
  relatedVideos: Array<{
    id: string;
    title: string;
    description: string;
    tags: string[];
    thumbnailUrl?: string | null;
    durationSeconds: number;
  }>;
}>) {
  const [seekMessage, setSeekMessage] = useState<string | null>(null);

  const keyTimestamps = useMemo(() => video.keyTimestamps ?? [], [video.keyTimestamps]);

  const copyTranscript = async () => {
    await navigator.clipboard.writeText(video.transcript);
    setSeekMessage('Transcript copied to clipboard.');
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.6fr_0.95fr]">
      <div className="space-y-6">
        <Card className="glass-panel border-white/10 p-4 md:p-6">
          <VideoPlayer
            video={video}
            onProgress={async (seconds, completed) => {
              await fetch(`/api/video/${video.id}/watch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ watchedSeconds: seconds, completed })
              });
            }}
          />
          <div className="mt-5 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight">{video.title}</h1>
              <Badge className="border-cyan-300/20 bg-cyan-400/10 text-cyan-100">{formatDuration(video.durationSeconds)}</Badge>
            </div>
            <p className="max-w-4xl text-slate-300">{video.description}</p>
            <div className="flex flex-wrap gap-2">
              {video.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="glass-panel border-white/10 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Summary</p>
                <h2 className="text-xl font-semibold">AI video summary</h2>
              </div>
            </div>
            <p className="text-sm leading-7 text-slate-300">{video.shortSummary || 'A summary will appear once AI processing completes.'}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {video.bulletPoints.map((point) => (
                <li key={point} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  {point}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="glass-panel border-white/10 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Learning mode</p>
                <h2 className="text-xl font-semibold">Notes and quiz</h2>
              </div>
            </div>
            <div className="space-y-3">
              {video.notes.map((note) => (
                <div key={note} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  {note}
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              {video.quizQuestions.map((question) => (
                <div key={question.question} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
                  <p className="font-medium text-white">{question.question}</p>
                  <p className="mt-1 text-sm text-cyan-100/80">Answer: {question.answer}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="glass-panel border-white/10 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Timestamps</p>
              <h2 className="text-xl font-semibold">Key moments in the video</h2>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {keyTimestamps.map((timestamp) => (
              <button
                key={`${timestamp.time}-${timestamp.label}`}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-cyan-300/30 hover:bg-white/8"
                onClick={() => setSeekMessage(`${timestamp.time} - ${timestamp.label}`)}
                type="button"
              >
                <p className="text-sm font-semibold text-white">{timestamp.label}</p>
                <p className="text-xs uppercase tracking-[0.26em] text-cyan-300">{timestamp.time}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{timestamp.note}</p>
              </button>
            ))}
          </div>
          {seekMessage ? <p className="mt-4 text-sm text-cyan-100">Selected: {seekMessage}</p> : null}
        </Card>

        <Card className="glass-panel border-white/10 p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Transcript</p>
              <h2 className="text-xl font-semibold">Source material</h2>
            </div>
            <Button variant="secondary" onClick={copyTranscript}>
              <ClipboardCopy className="h-4 w-4" />
              Copy transcript
            </Button>
          </div>
          <p className="whitespace-pre-wrap rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm leading-7 text-slate-300">
            {video.transcript || 'Transcript will appear here after processing.'}
          </p>
        </Card>
      </div>

      <div className="space-y-6">
        <AskVideoForm videoId={video.id} transcript={video.transcript} timestamps={video.keyTimestamps} />

        <Card className="glass-panel border-white/10 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Creator tools</p>
              <h2 className="text-xl font-semibold">Auto-generated metadata</h2>
            </div>
          </div>
          {video.creatorCopy ? (
            <div className="space-y-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.26em] text-slate-500">Title</p>
                <p className="mt-2 text-white">{video.creatorCopy.title}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.26em] text-slate-500">Description</p>
                <p className="mt-2 leading-6">{video.creatorCopy.description}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.26em] text-slate-500">Thumbnail prompt</p>
                <p className="mt-2 leading-6">{video.creatorCopy.thumbnailPrompt}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-6 text-slate-400">
              Creator metadata can be generated automatically from the transcript once OpenAI processing completes.
            </p>
          )}
        </Card>

        <Card className="glass-panel border-white/10 p-6">
          <p className="mb-4 text-xs uppercase tracking-[0.28em] text-slate-500">Related videos</p>
          <div className="space-y-3">
            {relatedVideos.map((related) => (
              <Link key={related.id} href={`/videos/${related.id}`}>
                <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:border-cyan-300/30 hover:bg-white/8">
                  <img
                    src={related.thumbnailUrl || '/video-thumb.svg'}
                    alt={related.title}
                    className="h-20 w-28 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">{clampText(related.title, 48)}</p>
                    <p className="mt-1 text-sm text-slate-400">{clampText(related.description, 72)}</p>
                    <p className="mt-2 text-xs text-cyan-100/70">{formatDuration(related.durationSeconds)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}