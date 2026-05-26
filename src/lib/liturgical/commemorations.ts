import type { OrthocalDay } from '../api/orthocal';
import { stripHtml } from '../api/orthocal';
import {
  annunciationFeastNameFromOrthocal,
  liturgicalDayTitle,
  transferredGreatFeastOnHolyWeekDay,
} from './liturgicalDayTitle';
import { sanitizeTypikonProse } from './typikonSymbols';

const PALM_SUNDAY_PATTERN = /\bpalm sunday\b/i;

export type LiturgicalFeastContext = {
  appearanceKey: string;
  appearanceLabel: string;
};

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

function nameFromOrthocalHeadlines(day: OrthocalDay | null, pattern: RegExp): string | null {
  if (!day) return null;
  const candidates = [
    ...(day.titles ?? []),
    day.summary_title ?? '',
    day.feast_level_description ?? '',
  ];
  for (const raw of candidates) {
    const name = sanitizeTypikonProse(String(raw).trim());
    if (name && pattern.test(name)) return name;
  }
  return null;
}

/** When orthocal has no `feasts[]` entry but the local calendar marks a feast day. */
function liturgicalFeastFallbackName(
  day: OrthocalDay | null,
  liturgical: LiturgicalFeastContext,
): string | null {
  if ((day?.feasts ?? []).some((f) => f.trim())) return null;

  const { appearanceKey, appearanceLabel } = liturgical;

  if (appearanceKey === 'palm_sunday' || day?.pascha_distance === -7) {
    return (
      nameFromOrthocalHeadlines(day, PALM_SUNDAY_PATTERN) ??
      (sanitizeTypikonProse(appearanceLabel.trim()) || 'Palm Sunday')
    );
  }

  if (appearanceKey === 'annunciation') {
    return annunciationFeastNameFromOrthocal(day) ?? sanitizeTypikonProse(appearanceLabel.trim());
  }

  return null;
}

function hasFeastNamed(entries: CommemorationEntry[], name: string): boolean {
  const key = name.trim().toLowerCase();
  return entries.some((e) => e.kind === 'feast' && e.name.trim().toLowerCase() === key);
}

function hasSaintNamed(entries: CommemorationEntry[], name: string): boolean {
  const key = name.trim().toLowerCase();
  return entries.some((e) => e.kind === 'saint' && e.name.trim().toLowerCase() === key);
}

/**
 * Great feasts often have a life account only in orthocal `stories[]`, linked from `feasts[]`.
 * Show the liturgical name under Feasts and the hagiography under Saints.
 */
function addSaintEntryForFeastStory(
  entries: CommemorationEntry[],
  feastName: string,
  story: { title: string; story: string },
): void {
  const saintName = sanitizeTypikonProse(story.title.trim());
  if (!saintName) return;
  if (saintName.trim().toLowerCase() === feastName.trim().toLowerCase()) return;
  if (hasSaintNamed(entries, saintName)) return;
  entries.push({
    id: `saint:${saintName}`,
    name: saintName,
    kind: 'saint',
    storyTitle: story.title,
    body: stripHtml(story.story),
  });
}

function prependFeastIfMissing(
  entries: CommemorationEntry[],
  name: string,
  stories: NonNullable<OrthocalDay['stories']>,
  usedStoryTitles: Set<string>,
): void {
  if (!name.trim() || hasFeastNamed(entries, name)) return;
  const story = findStoryForName(name, stories);
  if (story?.title) usedStoryTitles.add(story.title);
  entries.unshift({
    id: `feast:${name}`,
    name,
    kind: 'feast',
    storyTitle: story?.title,
    body: story ? stripHtml(story.story) : undefined,
  });
}

export function buildCommemorationEntries(
  day: OrthocalDay | null,
  liturgical?: LiturgicalFeastContext,
): CommemorationEntry[] {
  if (!day) return [];

  const stories = day.stories ?? [];
  const entries: CommemorationEntry[] = [];
  const usedStoryTitles = new Set<string>();

  for (const feast of day.feasts ?? []) {
    const trimmed = feast.trim();
    if (!trimmed) continue;
    const story = findStoryForName(trimmed, stories);
    let linkedSaint = false;
    if (story?.title) {
      usedStoryTitles.add(story.title);
      const countBefore = entries.length;
      addSaintEntryForFeastStory(entries, trimmed, story);
      linkedSaint = entries.length > countBefore;
    }
    entries.push({
      id: `feast:${trimmed}`,
      name: trimmed,
      kind: 'feast',
      storyTitle: linkedSaint ? undefined : story?.title,
      body: linkedSaint ? undefined : story ? stripHtml(story.story) : undefined,
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

  if (liturgical && !entries.some((e) => e.kind === 'feast')) {
    const fallbackName = liturgicalFeastFallbackName(day, liturgical);
    if (fallbackName) {
      const story = findStoryForName(fallbackName, stories);
      if (story?.title) usedStoryTitles.add(story.title);
      entries.unshift({
        id: `feast:${fallbackName}`,
        name: fallbackName,
        kind: 'feast',
        storyTitle: story?.title,
        body: story ? stripHtml(story.story) : undefined,
      });
    }
  }

  const extraFeasts: string[] = [];
  const annunciation = annunciationFeastNameFromOrthocal(day);
  if (annunciation) extraFeasts.push(annunciation);
  if (liturgical) {
    const dayTitle = liturgicalDayTitle(
      day,
      liturgical.appearanceKey,
      liturgical.appearanceLabel,
      null,
    );
    const transferred = transferredGreatFeastOnHolyWeekDay(
      day,
      liturgical.appearanceKey,
      dayTitle,
    );
    if (transferred) extraFeasts.push(transferred);
  }
  for (let i = extraFeasts.length - 1; i >= 0; i--) {
    prependFeastIfMissing(entries, extraFeasts[i], stories, usedStoryTitles);
  }

  return entries;
}

export function partitionCommemorations(entries: CommemorationEntry[]): {
  feasts: CommemorationEntry[];
  saints: CommemorationEntry[];
} {
  const feasts: CommemorationEntry[] = [];
  const saints: CommemorationEntry[] = [];
  for (const entry of entries) {
    if (entry.kind === 'feast') feasts.push(entry);
    else saints.push(entry);
  }
  return { feasts, saints };
}
