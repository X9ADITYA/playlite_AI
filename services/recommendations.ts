import type { HydratedDocument } from 'mongoose';

import type { UserRecord } from '@/models/User';
import type { VideoRecord } from '@/models/Video';
import type { WatchEventRecord } from '@/models/WatchEvent';

export interface RecommendationResult {
  video: VideoRecord & { _id: string; createdAt?: Date; updatedAt?: Date };
  score: number;
  reason: string;
}

function normalizeTerms(values: string[]) {
  return values.map((value) => value.toLowerCase().trim()).filter(Boolean);
}

function durationScore(video: VideoRecord, maxDurationMinutes?: number) {
  if (!maxDurationMinutes) {
    return 0;
  }

  const maxDurationSeconds = maxDurationMinutes * 60;
  if (video.durationSeconds <= maxDurationSeconds) {
    return Math.max(0, 18 - Math.floor(video.durationSeconds / 90));
  }

  return -6;
}

function recencyScore(video: VideoRecord & { createdAt?: Date }) {
  if (!video.createdAt) {
    return 0;
  }

  const ageHours = (Date.now() - new Date(video.createdAt).getTime()) / (1000 * 60 * 60);
  return Math.max(0, 14 - ageHours / 12);
}

export function buildRecommendations(args: {
  videos: Array<VideoRecord & { _id: string; createdAt?: Date; updatedAt?: Date }>;
  user: UserRecord & { _id: string } | null;
  watchHistory: Array<WatchEventRecord & { video?: VideoRecord }>;
  limit?: number;
}) {
  const limit = args.limit ?? 8;
  const preferredTopics = normalizeTerms(args.user?.preferences.topics ?? []);
  const preferredLanguages = normalizeTerms(args.user?.preferences.languages ?? ['en']);
  const watchedTags = new Map<string, number>();
  const watchedCreators = new Map<string, number>();

  for (const event of args.watchHistory) {
    if (!event.video) {
      continue;
    }

    for (const tag of event.video.tags ?? []) {
      watchedTags.set(tag.toLowerCase(), (watchedTags.get(tag.toLowerCase()) ?? 0) + 1);
    }

    const creatorKey = String(event.video.creatorId);
    watchedCreators.set(creatorKey, (watchedCreators.get(creatorKey) ?? 0) + 1);
  }

  const recommendations = args.videos.map((video) => {
    const normalizedTags = normalizeTerms(video.tags ?? []);
    let score = 0;
    const reasons: string[] = [];

    for (const topic of preferredTopics) {
      if (normalizedTags.some((tag) => tag.includes(topic) || topic.includes(tag))) {
        score += 12;
        reasons.push(`matches your topic: ${topic}`);
      }
    }

    if (preferredLanguages.includes(video.language?.toLowerCase() ?? 'en')) {
      score += 8;
      reasons.push(`matches your language preference (${video.language})`);
    }

    for (const tag of normalizedTags) {
      if (watchedTags.has(tag)) {
        score += Math.min(10, watchedTags.get(tag) ?? 0);
      }
    }

    if (watchedCreators.has(String(video.creatorId))) {
      score += 10;
      reasons.push('from a creator you watched before');
    }

    score += durationScore(video, args.user?.preferences.maxVideoDurationMinutes);
    score += recencyScore(video);

    if (video.viewCount) {
      score += Math.min(6, video.viewCount / 250);
    }

    if (reasons.length === 0 && normalizedTags.length > 0) {
      reasons.push(`tag overlap: ${normalizedTags.slice(0, 2).join(', ')}`);
    }

    return {
      video,
      score: Number(score.toFixed(2)),
      reason: reasons.slice(0, 2).join(' · ') || 'popular and relevant'
    } satisfies RecommendationResult;
  });

  return recommendations.sort((left, right) => right.score - left.score).slice(0, limit);
}

export type RecommendationList = ReturnType<typeof buildRecommendations>;