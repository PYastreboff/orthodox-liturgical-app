/**
 * Remote Basil liturgy text (JSON on GitHub). Bundled copy used as fallback.
 */
import bundledLiturgy from '../../../data/liturgy/basil-liturgy.json';
import type { BasilSection, BasilSectionId } from './basilLiturgy';
import { BASIL_SECTION_IDS } from './basilLiturgy';
import { sectionUnits } from './liturgyUnit';

const DEFAULT_URLS = [
  'https://raw.githubusercontent.com/PYastreboff/orthodox-liturgical-app/main/data/liturgy/basil-liturgy.json',
  'https://cdn.jsdelivr.net/gh/PYastreboff/orthodox-liturgical-app@main/data/liturgy/basil-liturgy.json',
] as const;

type LiturgyPayload = {
  version?: number;
  updated?: string;
  source?: string;
  sections: BasilSection[];
};

export type BasilLiturgyState =
  | { status: 'loading'; sections: readonly BasilSection[] }
  | { status: 'ready'; sections: readonly BasilSection[] }
  | { status: 'offline'; sections: readonly BasilSection[]; error: string };

let memoryCache: readonly BasilSection[] | null = null;
let memorySource = '';
let inflight: Promise<readonly BasilSection[]> | null = null;

function libraryUrls(): string[] {
  const override =
    typeof process !== 'undefined' && process.env.EXPO_PUBLIC_LITURGY_LIBRARY_URL?.trim();
  return override ? [override, ...DEFAULT_URLS] : [...DEFAULT_URLS];
}

function isSection(value: unknown): value is BasilSection {
  if (!value || typeof value !== 'object') return false;
  const section = value as BasilSection;
  if (typeof section.id !== 'string' || !BASIL_SECTION_IDS.includes(section.id as BasilSectionId)) {
    return false;
  }
  return sectionUnits(section).length > 0;
}

function parsePayload(data: unknown): { sections: BasilSection[]; source: string } {
  if (!data || typeof data !== 'object') throw new Error('Invalid liturgy library');
  const payload = data as LiturgyPayload;
  const sections = payload.sections;
  if (!Array.isArray(sections) || sections.length === 0) {
    throw new Error('Liturgy library is empty');
  }
  const valid = sections.filter(isSection);
  if (valid.length < BASIL_SECTION_IDS.length) {
    throw new Error('Liturgy library is incomplete');
  }
  return { sections: valid, source: payload.source ?? '' };
}

function hasAlignedUnits(sections: BasilSection[]): boolean {
  return sections.some((section) => (section.units?.length ?? 0) > 0);
}

function payloadVersion(data: LiturgyPayload): number {
  return typeof data.version === 'number' ? data.version : 0;
}

function preferNewerSections(
  current: { sections: BasilSection[]; source: string; version: number },
  candidate: { sections: BasilSection[]; source: string; version: number },
): { sections: BasilSection[]; source: string; version: number } {
  if (!hasAlignedUnits(candidate.sections)) return current;
  if (!hasAlignedUnits(current.sections)) return candidate;
  return candidate.version >= current.version ? candidate : current;
}

export async function fetchBasilLiturgy(options?: {
  force?: boolean;
}): Promise<readonly BasilSection[]> {
  if (!options?.force && memoryCache) return memoryCache;
  if (!options?.force && inflight) return inflight;

  inflight = (async () => {
    try {
      const bundled = parsePayload(bundledLiturgy);
      let best = {
        sections: bundled.sections,
        source: bundled.source || 'Bundled liturgy library',
        version: payloadVersion(bundledLiturgy as LiturgyPayload),
      };

      for (const url of libraryUrls()) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 20000);
          try {
            const response = await fetch(url, {
              signal: controller.signal,
              headers: { Accept: 'application/json' },
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data: unknown = await response.json();
            const remote = parsePayload(data);
            best = preferNewerSections(best, {
              sections: remote.sections,
              source: remote.source,
              version: payloadVersion(data as LiturgyPayload),
            });
          } finally {
            clearTimeout(timeout);
          }
        } catch {
          // try next URL
        }
      }

      memoryCache = best.sections;
      memorySource = best.source;
      return best.sections;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export function getCachedBasilLiturgy(): readonly BasilSection[] | null {
  return memoryCache;
}

export function getBasilLiturgySource(): string {
  return memorySource;
}
