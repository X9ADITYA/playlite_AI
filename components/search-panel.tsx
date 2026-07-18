"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Search, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { clampText, formatDuration } from '@/lib/utils';

function matchLabel(score: number) {
  if (score >= 30) return { text: 'Excellent match', tone: 'border-emerald-300/30 bg-emerald-400/10 text-emerald-100' };
  if (score >= 18) return { text: 'Great match', tone: 'border-cyan-300/30 bg-cyan-400/10 text-cyan-100' };
  if (score >= 8) return { text: 'Good match', tone: 'border-slate-300/20 bg-white/5 text-slate-200' };
  return { text: 'Related', tone: 'border-slate-300/10 bg-white/5 text-slate-400' };
}

export function SearchPanel() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<
    Array<{ id: string; title: string; description: string; tags: string[]; durationSeconds: number; videoUrl: string; score: number; reason: string }>
  >([]);
  const [summary, setSummary] = useState('');

  async function runSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      const payload = (await response.json()) as {
        results: Array<{ video: { id: string; title: string; description: string; tags: string[]; durationSeconds: number; videoUrl: string }; score: number; reason: string }>;
        interpretation?: { summary?: string };
      };

      setResults(payload.results.map((item) => ({ ...item.video, score: item.score, reason: item.reason })));
      setSummary(payload.interpretation?.summary ?? 'Search completed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6" id="search">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
          <Search className="h-5 w-5" />
        </div>
        <div>
          <p className="telemetry-rule font-mono-label text-xs text-slate-500">Conversational search</p>
          <h2 className="text-xl font-semibold">Ask for a type of video</h2>
        </div>
      </div>

      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={runSearch}>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="e.g. Show beginner React videos under 10 minutes"
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !query.trim()} className="sm:w-28">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
        </Button>
      </form>

      {hasSearched ? (
        <>
          <p className="mt-3 text-sm text-slate-400">{summary}</p>
          <div className="mt-4 grid gap-3">
            {results.length === 0 && !loading ? (
              <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-slate-400">
                No matches yet — try a broader phrase.
              </p>
            ) : (
              results.slice(0, 4).map((result) => {
                const match = matchLabel(result.score);
                return (
                  <Link key={result.id} href={`/videos/${result.id}`}>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/30 hover:bg-white/8">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-white">{clampText(result.title, 42)}</h3>
                          <p className="text-sm text-slate-400">{clampText(result.description, 84)}</p>
                        </div>
                        <Badge className={`shrink-0 whitespace-nowrap ${match.tone}`}>{match.text}</Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-xs text-slate-500">
                        <span>{formatDuration(result.durationSeconds)}</span>
                        <span>•</span>
                        <span>{result.reason}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {result.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag}>{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </>
      ) : (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-400">
          <Sparkles className="h-4 w-4 shrink-0 text-cyan-300" />
          Try something like "short Python tutorials for beginners" or "advanced ML videos under 15 minutes."
        </div>
      )}
    </Card>
  );
}