"use client";

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, LogIn, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type AuthMode = 'login' | 'signup';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'mr', label: 'Marathi' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
];

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: Readonly<{
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}>) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-rose-300">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

function SectionHeading({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400/70">{children}</span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

export function AuthForm({ mode }: Readonly<{ mode: AuthMode }>) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    topics: '',
    learningGoals: '',
    languages: 'en',
    maxVideoDurationMinutes: '20',
  });

  const title = useMemo(() => (mode === 'login' ? 'Welcome back' : 'Create your PlayLite account'), [mode]);
  const subtitle = useMemo(
    () =>
      mode === 'login'
        ? 'Sign in to pick up your video learning where you left off.'
        : 'Set up your profile so recommendations start relevant from day one.',
    [mode]
  );

  function validate() {
    const errors: Record<string, string> = {};
    if (mode === 'signup' && !form.name.trim()) errors.name = 'Enter your full name.';
    if (!form.email.trim()) errors.email = 'Enter your email address.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Enter a valid email address.';
    if (!form.password) errors.password = 'Enter a password.';
    else if (mode === 'signup' && form.password.length < 8) errors.password = 'Use at least 8 characters.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          topics: form.topics.split(',').map((value) => value.trim()).filter(Boolean),
          learningGoals: form.learningGoals.split(',').map((value) => value.trim()).filter(Boolean),
          languages: form.languages.split(',').map((value) => value.trim()).filter(Boolean),
          maxVideoDurationMinutes: Number(form.maxVideoDurationMinutes || 0),
        }),
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
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>
      </div>

      <form className="grid gap-5" onSubmit={onSubmit} noValidate>
        <SectionHeading>Account</SectionHeading>

        {mode === 'signup' ? (
          <Field label="Full name" htmlFor="name" error={fieldErrors.name}>
            <Input
              id="name"
              placeholder="Aaditya Sharma"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </Field>
        ) : null}

        <Field label="Email address" htmlFor="email" error={fieldErrors.email}>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          error={fieldErrors.password}
          hint={mode === 'signup' ? 'At least 8 characters.' : undefined}
        >
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        {mode === 'signup' ? (
          <>
            <SectionHeading>Learning preferences</SectionHeading>

            <Field label="Topics you like" htmlFor="topics" hint="Comma separated, e.g. machine learning, astrophysics">
              <Textarea
                id="topics"
                placeholder="machine learning, astrophysics, web development"
                value={form.topics}
                onChange={(event) => setForm((current) => ({ ...current, topics: event.target.value }))}
                rows={2}
              />
            </Field>

            <Field label="Learning goals" htmlFor="learningGoals" hint="Comma separated, e.g. ace DSA interviews">
              <Textarea
                id="learningGoals"
                placeholder="ace DSA interviews, build a portfolio project"
                value={form.learningGoals}
                onChange={(event) => setForm((current) => ({ ...current, learningGoals: event.target.value }))}
                rows={2}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Preferred language" htmlFor="languages">
                <select
                  id="languages"
                  value={form.languages}
                  onChange={(event) => setForm((current) => ({ ...current, languages: event.target.value }))}
                  className="h-10 w-full rounded-md border border-white/10 bg-slate-900/60 px-3 text-sm text-slate-100 focus:border-cyan-400/60 focus:outline-none"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Max video length" htmlFor="maxVideoDurationMinutes" hint="1–180 minutes">
                <div className="relative">
                  <Input
                    id="maxVideoDurationMinutes"
                    type="number"
                    min="1"
                    max="180"
                    value={form.maxVideoDurationMinutes}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, maxVideoDurationMinutes: event.target.value }))
                    }
                    className="pr-12"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                    min
                  </span>
                </div>
              </Field>
            </div>
          </>
        ) : null}

        {error ? (
          <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {mode === 'login' ? 'Login' : 'Create account'}
        </Button>
      </form>
    </Card>
  );
}