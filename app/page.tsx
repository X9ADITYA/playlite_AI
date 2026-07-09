import Link from 'next/link';
import { ArrowRight, BrainCircuit, Clapperboard, Sparkles, UploadCloud, Wand2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { clampText } from '@/lib/utils';

const highlights = [
  'Upload videos and generate transcripts automatically.',
  'Ask questions with timestamp-aware answers.',
  'Get smart recommendations based on watch history and preferences.',
  'Switch into learning mode for notes, quizzes, and highlights.'
];

const featureCards = [
  {
    title: 'AI Summaries',
    text: 'Short summaries, bullet points, and key timestamps are created after every upload.',
    icon: BrainCircuit
  },
  {
    title: 'Ask the Video',
    text: 'A transcript-backed Q&A panel answers contextually and points you to the right moment.',
    icon: Sparkles
  },
  {
    title: 'Creator Tools',
    text: 'Generate titles, descriptions, and thumbnail prompts from a transcript-first workflow.',
    icon: Wand2
  }
];

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-mesh opacity-100" />
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:px-10">
        <header className="glass-panel flex items-center justify-between rounded-3xl px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">PlayLite AI</p>
            <h1 className="text-xl font-semibold tracking-tight">Video learning, accelerated.</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:py-14">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
                <UploadCloud className="h-4 w-4" />
                Upload once. Learn forever.
              </div>
              <div className="space-y-4">
                <h2 className="max-w-3xl text-5xl font-semibold tracking-tight text-balance md:text-6xl">
                  The AI video workspace for people who want answers, not just playback.
                </h2>
                <p className="max-w-2xl text-lg leading-8 text-slate-300">
                  PlayLite AI turns video libraries into an interactive learning surface with transcription,
                  summaries, Q&A, recommendations, and creator tooling in one clean app.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/dashboard">Open Dashboard</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">Create Account</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {highlights.map((highlight) => (
                <Card key={highlight} className="glass-panel border-white/10 bg-white/5 p-4">
                  <p className="text-sm leading-6 text-slate-200">{highlight}</p>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <Card className="glass-panel overflow-hidden border-white/10 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Featured workflow</p>
                  <h3 className="mt-1 text-2xl font-semibold">Watch. Ask. Learn.</h3>
                </div>
                <Clapperboard className="h-9 w-9 text-cyan-300" />
              </div>
              <div className="grid gap-4">
                {featureCards.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.title} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <div className="flex items-start gap-4">
                        <div className="rounded-xl bg-cyan-400/10 p-3 text-cyan-300">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{feature.title}</h4>
                          <p className="mt-1 text-sm leading-6 text-slate-400">{clampText(feature.text, 120)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="glass-panel border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Stack</p>
                  <h3 className="mt-1 text-xl font-semibold">Built for extension, not a demo trap.</h3>
                </div>
                <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">
                  Production-ready
                </div>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                {['Next.js App Router', 'MongoDB + Mongoose', 'JWT auth', 'OpenAI', 'Cloudinary or local storage', 'Tailwind + shadcn UI'].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}