"use client";

import { useState } from 'react';
import { Loader2, MessageSquareMore } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function AskVideoForm({
  videoId,
  transcript,
  timestamps
}: Readonly<{
  videoId: string;
  transcript: string;
  timestamps: Array<{ label: string; time: string; note: string }>;
}>) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<{ answer: string; timestamp?: string } | null>(null);

  async function ask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer(null);

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, question, transcript, timestamps })
      });

      const payload = (await response.json()) as { answer: string; timestamp?: string };
      setAnswer(payload);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="glass-panel border-white/10 p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
          <MessageSquareMore className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Ask the video</p>
          <h2 className="text-xl font-semibold">Transcript-backed Q&amp;A</h2>
        </div>
      </div>

      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={ask}>
        <Input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="e.g. What is the main takeaway?"
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !question.trim()} className="sm:w-28">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ask'}
        </Button>
      </form>

      {answer ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
          <p>{answer.answer}</p>
          {answer.timestamp ? (
            <p className="mt-3 text-xs uppercase tracking-[0.28em] text-cyan-300">Reference: {answer.timestamp}</p>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}