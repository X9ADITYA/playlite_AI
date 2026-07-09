"use client";

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LogIn, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type AuthMode = 'login' | 'signup';

export function AuthForm({ mode }: Readonly<{ mode: AuthMode }>) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    topics: '',
    learningGoals: '',
    languages: 'en',
    maxVideoDurationMinutes: '20'
  });

  const title = useMemo(() => (mode === 'login' ? 'Welcome back' : 'Create your PlayLite account'), [mode]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          topics: form.topics.split(',').map((value) => value.trim()).filter(Boolean),
          learningGoals: form.learningGoals.split(',').map((value) => value.trim()).filter(Boolean),
          languages: form.languages.split(',').map((value) => value.trim()).filter(Boolean),
          maxVideoDurationMinutes: Number(form.maxVideoDurationMinutes || 0)
        })
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || 'Authentication failed');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="glass-panel mx-auto w-full max-w-2xl border-white/10 p-6 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
          {mode === 'login' ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">PlayLite AI</p>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        </div>
      </div>

      <form className="grid gap-4" onSubmit={onSubmit}>
        {mode === 'signup' ? (
          <Input
            placeholder="Full name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
        ) : null}
        <Input
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          required
        />

        {mode === 'signup' ? (
          <>
            <Textarea
              placeholder="Topics you like, comma separated"
              value={form.topics}
              onChange={(event) => setForm((current) => ({ ...current, topics: event.target.value }))}
            />
            <Textarea
              placeholder="Learning goals, comma separated"
              value={form.learningGoals}
              onChange={(event) => setForm((current) => ({ ...current, learningGoals: event.target.value }))}
            />
            <Input
              placeholder="Preferred languages, comma separated"
              value={form.languages}
              onChange={(event) => setForm((current) => ({ ...current, languages: event.target.value }))}
            />
            <Input
              type="number"
              min="1"
              max="180"
              placeholder="Max video duration (minutes)"
              value={form.maxVideoDurationMinutes}
              onChange={(event) => setForm((current) => ({ ...current, maxVideoDurationMinutes: event.target.value }))}
            />
          </>
        ) : null}

        {error ? <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</p> : null}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {mode === 'login' ? 'Login' : 'Create account'}
        </Button>
      </form>
    </Card>
  );
}