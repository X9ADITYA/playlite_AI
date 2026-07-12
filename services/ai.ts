import OpenAI from 'openai';

import type { CreatorCopy, LearningPack, LearningQuestion, SummaryRecord, SummaryTimestamp } from '@/models/Video';

const groq = process.env.GROQ_API_KEY
  ? new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1'
    })
  : null;

function trimContext(text: string, maxLength = 8000) {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function normalizeJsonBlock(value: string) {
  const fenced = value.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    return fenced[1];
  }

  const codeBlock = value.match(/```\s*([\s\S]*?)\s*```/i);
  if (codeBlock?.[1]) {
    return codeBlock[1];
  }

  return value;
}

async function runStructuredPrompt<T>(args: {
  system: string;
  user: string;
  fallback: () => T;
}): Promise<T> {
  if (!groq) {
    return args.fallback();
  }

  try {
    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: args.system },
        { role: 'user', content: args.user }
      ]
    });

    const content = response.choices[0]?.message?.content ?? '';
    const normalized = normalizeJsonBlock(content);
    return JSON.parse(normalized) as T;
  } catch (error) {
    console.error('Groq completion failed:', error);
    return args.fallback();
  }
}

function transcriptSegments(transcript: string) {
  return transcript
    .split(/(?<=[.!?])\s+/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function buildFallbackTimestamps(transcript: string) {
  const segments = transcriptSegments(transcript).slice(0, 4);
  return segments.map((segment, index) => ({
    label: `Segment ${index + 1}`,
    time: `${String(Math.floor(index / 2) * 5).padStart(2, '0')}:${String((index % 2) * 12).padStart(2, '0')}`,
    note: segment.slice(0, 120)
  }));
}

function buildFallbackSummary(transcript: string): SummaryRecord {
  const segments = transcriptSegments(transcript);
  const bulletPoints = segments.slice(0, 5).map((segment) => segment.slice(0, 140));

  return {
    shortSummary: segments.slice(0, 2).join(' ') || transcript.slice(0, 220),
    bulletPoints,
    keyTimestamps: buildFallbackTimestamps(transcript)
  };
}

function buildFallbackLearningPack(transcript: string): LearningPack {
  const summary = buildFallbackSummary(transcript);
  const notes = [
    summary.shortSummary,
    ...summary.bulletPoints.slice(0, 3).map((bullet) => `Key point: ${bullet}`)
  ].filter(Boolean);

  const quizQuestions: LearningQuestion[] = summary.bulletPoints.slice(0, 3).map((bullet, index) => ({
    question: `What is the main idea of point ${index + 1}?`,
    options: [],
    answer: bullet
  }));

  return { notes, quizQuestions };
}

function locateBestTimestamp(question: string, timestamps: SummaryTimestamp[]) {
  const normalizedQuestion = question.toLowerCase();
  const candidate = timestamps.find((timestamp) => timestamp.note.toLowerCase().split(/\s+/).some((word) => normalizedQuestion.includes(word)));
  return candidate?.time || timestamps[0]?.time || '00:00';
}

function buildFallbackAnswer(question: string, transcript: string, timestamps: SummaryTimestamp[]) {
  const segments = transcriptSegments(transcript);
  const scored = segments
    .map((segment) => {
      const overlap = question
        .toLowerCase()
        .split(/\W+/)
        .filter(Boolean)
        .reduce((score, term) => (segment.toLowerCase().includes(term) ? score + 1 : score), 0);
      return { segment, overlap };
    })
    .sort((left, right) => right.overlap - left.overlap);

  const best = scored[0]?.segment || segments[0] || transcript.slice(0, 220);

  return {
    answer: best,
    timestamp: locateBestTimestamp(question, timestamps)
  };
}

export async function generateVideoSummary(title: string, transcript: string) {
  return runStructuredPrompt<SummaryRecord>({
    system:
      'You summarize educational videos. Return concise JSON with shortSummary, bulletPoints array, and keyTimestamps array of {label,time,note}.',
    user: `Video title: ${title}\n\nTranscript:\n${trimContext(transcript)}`,
    fallback: () => buildFallbackSummary(transcript)
  });
}

export async function answerVideoQuestion(title: string, transcript: string, question: string, timestamps: SummaryTimestamp[]) {
  return runStructuredPrompt<{ answer: string; timestamp: string }>({
    system:
      'You answer questions about a video using only the provided transcript context. Return JSON with answer and timestamp. Mention uncertainty when needed.',
    user: `Video title: ${title}\nQuestion: ${question}\nTranscript:\n${trimContext(transcript)}\nTimestamps:\n${JSON.stringify(timestamps)}`,
    fallback: () => buildFallbackAnswer(question, transcript, timestamps)
  });
}

export async function generateLearningPack(title: string, transcript: string) {
  return runStructuredPrompt<LearningPack>({
    system:
      'You create study notes and quiz questions from educational video transcripts. Return JSON with notes array and quizQuestions array of {question, options, answer}.',
    user: `Video title: ${title}\n\nTranscript:\n${trimContext(transcript)}`,
    fallback: () => buildFallbackLearningPack(transcript)
  });
}

export async function generateCreatorCopy(title: string, transcript: string) {
  return runStructuredPrompt<CreatorCopy>({
    system:
      'You generate creator-facing metadata for a video. Return JSON with title, description, and thumbnailPrompt.',
    user: `Current title: ${title}\nTranscript:\n${trimContext(transcript)}`,
    fallback: () => ({
      title,
      description: transcript.slice(0, 250),
      thumbnailPrompt: `A modern thumbnail for ${title}, high contrast, cinematic, clean typography.`
    })
  });
}

export async function translateText(text: string, targetLanguage: string) {
  return runStructuredPrompt<{ translatedText: string }>({
    system: 'You translate educational text while preserving structure. Return JSON with translatedText only.',
    user: `Target language: ${targetLanguage}\nText:\n${trimContext(text)}`,
    fallback: () => ({ translatedText: `${text}\n\n[Translation unavailable without GROQ_API_KEY; target=${targetLanguage}]` })
  });
}

export async function interpretSearchQuery(query: string) {
  return runStructuredPrompt<{
    keywords: string[];
    maxDurationMinutes?: number;
    level?: 'beginner' | 'intermediate' | 'advanced';
    summary: string;
  }>({
    system:
      'You translate a conversational search query into structured filters. Return JSON with keywords, maxDurationMinutes, level, and summary.',
    user: `Query: ${query}`,
    fallback: () => ({
      keywords: query.split(/\s+/).filter((word) => word.length > 2),
      summary: query
    })
  });
}