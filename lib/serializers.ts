import type { RecommendationResult } from '@/services/recommendations';
import type { LearningQuestion, SummaryTimestamp, VideoRecord } from '@/models/Video';
import type { UserRecord } from '@/models/User';
import type { WatchEventRecord } from '@/models/WatchEvent';

export function serializeUser(user: any) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? null,
    preferences: user.preferences,
    createdAt: user.createdAt?.toISOString() ?? null,
    updatedAt: user.updatedAt?.toISOString() ?? null
  };
}

export function serializeVideo(video: any) {
  return {
    id: String(video._id),
    title: video.title,
    description: video.description,
    tags: video.tags ?? [],
    videoUrl: video.videoUrl,
    thumbnailUrl: video.thumbnailUrl ?? '/video-thumb.svg',
    durationSeconds: video.durationSeconds ?? 0,
    transcript: video.transcript ?? '',
    shortSummary: video.summary?.shortSummary ?? '',
    bulletPoints: video.summary?.bulletPoints ?? [],
    keyTimestamps: video.summary?.keyTimestamps ?? [],
    notes: video.learning?.notes ?? [],
    quizQuestions: video.learning?.quizQuestions ?? [],
    creatorCopy: video.creatorCopy ?? null,
    language: video.language ?? 'en',
    viewCount: video.viewCount ?? 0,
    creatorId: video.creatorId ? String(video.creatorId) : null,
    createdAt: video.createdAt?.toISOString() ?? null,
    updatedAt: video.updatedAt?.toISOString() ?? null
  };
}

export function serializeWatchEvent(event: any) {
  return {
    id: String(event._id),
    userId: String(event.userId),
    videoId: String(event.videoId),
    watchedSeconds: event.watchedSeconds,
    completed: event.completed,
    lastPosition: event.lastPosition,
    createdAt: event.createdAt?.toISOString() ?? null,
    updatedAt: event.updatedAt?.toISOString() ?? null
  };
}

export function serializeRecommendation(result: RecommendationResult) {
  return {
    ...serializeVideo(result.video),
    score: result.score,
    reason: result.reason
  };
}

export function serializeTimestampList(timestamps: SummaryTimestamp[]) {
  return timestamps.map((timestamp) => ({
    label: timestamp.label,
    time: timestamp.time,
    note: timestamp.note
  }));
}

export function serializeQuizQuestions(questions: LearningQuestion[]) {
  return questions.map((question) => ({
    question: question.question,
    options: question.options ?? [],
    answer: question.answer
  }));
}