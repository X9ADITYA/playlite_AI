"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { clampText, formatDuration } from '@/lib/utils';

export function SearchPanel() {
  const [query, setQuery] = useState('Show beginner React videos under 10 minutes');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<
    Array<{ id: string; title: string; description: string; tags: string[]; durationSeconds: number; videoUrl: string; score: number; reason: string }>
  >([]);
  const [summary, setSummary] = useState('');

  async function runSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

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
    <Card className="glass-panel border-white/10 p-6" id="search">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
          <Search className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Conversational search</p>
          <h2 className="text-xl font-semibold">Ask for a type of video</h2>
        </div>
      </div>

      <form className="flex gap-3" onSubmit={runSearch}>
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search videos conversationally" />
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Search
        </Button>
      </form>

      <p className="mt-3 text-sm text-slate-400">{summary}</p>

      <div className="mt-4 grid gap-3">
        {results.slice(0, 4).map((result) => (
          <Link key={result.id} href={`/videos/${result.id}`}>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/30 hover:bg-white/8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white">{clampText(result.title, 42)}</h3>
                  <p className="text-sm text-slate-400">{clampText(result.description, 84)}</p>
                </div>
                <Badge className="border-cyan-300/20 bg-cyan-400/10 text-cyan-100">{result.score.toFixed(1)}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
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
        ))}
      </div>
    </Card>
  );
}