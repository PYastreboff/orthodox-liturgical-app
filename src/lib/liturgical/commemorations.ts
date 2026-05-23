import type { OrthocalDay } from '../api/orthocal';
import { stripHtml } from '../api/orthocal';

export type CommemorationKind = 'saint' | 'feast';

export type CommemorationEntry = {
  id: string;
  name: string;
  kind: CommemorationKind;
  storyTitle?: string;
  body?: string;
};

function normalizeForMatch(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findStoryForName(
  name: string,
  stories: NonNullable<OrthocalDay['stories']>,
): { title: string; story: string } | undefined {
  const target = normalizeForMatch(name);
  if (!target) return undefined;

  let best: { title: string; story: string; score: number } | undefined;

  for (const story of stories) {
    const titleNorm = normalizeForMatch(story.title);
    if (!titleNorm) continue;

    if (titleNorm.includes(target) || target.includes(titleNorm)) {
      return story;
    }

    const targetWords = target.split(' ').filter((w) => w.length > 3);
    const score = targetWords.filter((w) => titleNorm.includes(w)).length;
    if (score >= 2 && (!best || score > best.score)) {
      best = { ...story, score };
    }
  }

  return best;
}

export function buildCommemorationEntries(day: OrthocalDay | null): CommemorationEntry[] {
  if (!day) return [];

  const stories = day.stories ?? [];
  const entries: CommemorationEntry[] = [];
  const usedStoryTitles = new Set<string>();

  for (const feast of day.feasts ?? []) {
    const trimmed = feast.trim();
    if (!trimmed) continue;
    const story = findStoryForName(trimmed, stories);
    if (story?.title) usedStoryTitles.add(story.title);
    entries.push({
      id: `feast:${trimmed}`,
      name: trimmed,
      kind: 'feast',
      storyTitle: story?.title,
      body: story ? stripHtml(story.story) : undefined,
    });
  }

  for (const saint of day.saints ?? []) {
    const trimmed = saint.trim();
    if (!trimmed) continue;
    const story = findStoryForName(trimmed, stories);
    if (story?.title) usedStoryTitles.add(story.title);
    entries.push({
      id: `saint:${trimmed}`,
      name: trimmed,
      kind: 'saint',
      storyTitle: story?.title,
      body: story ? stripHtml(story.story) : undefined,
    });
  }

  for (const story of stories) {
    if (usedStoryTitles.has(story.title)) continue;
    entries.push({
      id: `story:${story.title}`,
      name: story.title.trim(),
      kind: 'saint',
      storyTitle: story.title,
      body: stripHtml(story.story),
    });
  }

  return entries;
}
