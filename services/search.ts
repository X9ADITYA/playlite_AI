import type { VideoRecord } from '@/models/Video';
import { interpretSearchQuery } from '@/services/ai';

export interface SearchResult {
  video: VideoRecord & { _id: string; createdAt?: Date; updatedAt?: Date };
  score: number;
  reason: string;
}

function normalize(value: string) {
  return value.toLowerCase();
}

function searchTokens(query: string) {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.replace(/[^a-z0-9+.#-]/g, ''))
    .filter((term) => term.length > 2 && !['the', 'and', 'with', 'under', 'over', 'show'].includes(term));
}

function matchesDuration(video: VideoRecord, maxDurationMinutes?: number) {
  if (!maxDurationMinutes) {
    return true;
  }

  return video.durationSeconds <= maxDurationMinutes * 60;
}

export async function rankVideosForSearch(videos: Array<VideoRecord & { _id: string; createdAt?: Date; updatedAt?: Date }>, query: string) {
  const interpretation = await interpretSearchQuery(query);
  const tokens = interpretation.keywords.length > 0 ? interpretation.keywords.map(normalize) : searchTokens(query);

  const ranked = videos
    .filter((video) => matchesDuration(video, interpretation.maxDurationMinutes))
    .map((video) => {
      const title = normalize(video.title);
      const description = normalize(video.description);
      const tags = (video.tags ?? []).map(normalize);
      const transcript = normalize(video.transcript ?? '');
      let score = 0;
      const reasons: string[] = [];

      for (const token of tokens) {
        if (title.includes(token)) {
          score += 8;
          reasons.push(`title match: ${token}`);
        }

        if (description.includes(token)) {
          score += 4;
        }

        if (tags.some((tag) => tag.includes(token))) {
          score += 6;
          reasons.push(`tag match: ${token}`);
        }

        if (transcript.includes(token)) {
          score += 3;
        }
      }

      if (interpretation.level && tags.some((tag) => tag.includes(interpretation.level as string))) {
        score += 5;
        reasons.push(`difficulty: ${interpretation.level}`);
      }

      score += Math.min(5, (video.viewCount ?? 0) / 500);

      return {
        video,
        score: Number(score.toFixed(2)),
        reason: reasons.slice(0, 2).join(' · ') || interpretation.summary
      } satisfies SearchResult;
    })
    .filter((result) => result.score > 0 || tokens.length === 0)
    .sort((left, right) => right.score - left.score);

  return {
    interpretation,
    results: ranked
  };
}