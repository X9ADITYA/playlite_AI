"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function UploadVideoForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    tags: '',
    language: 'en'
  });
  const [file, setFile] = useState<File | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!file) {
        throw new Error('Please choose a video file.');
      }

      const payload = new FormData();
      payload.set('file', file);
      payload.set('title', form.title);
      payload.set('description', form.description);
      payload.set('tags', form.tags);
      payload.set('language', form.language);

      const response = await fetch('/api/video/upload', {
        method: 'POST',
        body: payload
      });

      let data: { error?: string; video?: { id: string } } | null = null;
      const contentType = response.headers.get('content-type') ?? '';

      if (contentType.includes('application/json')) {
        data = (await response.json()) as { error?: string; video?: { id: string } };
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Upload failed');
      }

      if (!data?.video?.id) {
        throw new Error('Upload succeeded but no video was returned');
      }

      setForm({ title: '', description: '', tags: '', language: 'en' });
      setFile(null);
      router.push(`/videos/${data.video.id}`);
      router.refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="glass-panel border-white/10 p-6" id="upload">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
          <Upload className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Upload</p>
          <h2 className="text-xl font-semibold">Add a new learning video</h2>
        </div>
      </div>

      <form className="grid gap-4" onSubmit={onSubmit}>
        <Input placeholder="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
        <Textarea
          placeholder="Description"
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          required
        />
        <Input placeholder="Tags, comma separated" value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} />
        <Input placeholder="Language code, e.g. en" value={form.language} onChange={(event) => setForm((current) => ({ ...current, language: event.target.value }))} />
        <input
          type="file"
          accept="video/*"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="block w-full rounded-xl border border-dashed border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-950"
          required
        />

        {error ? <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</p> : null}

        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Upload and generate AI insights
        </Button>
      </form>
    </Card>
  );
}