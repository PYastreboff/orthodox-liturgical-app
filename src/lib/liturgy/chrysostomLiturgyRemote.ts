/**
 * Remote Chrysostom liturgy text (JSON on GitHub). Bundled copy used as fallback.
 */
import bundledLiturgy from '../../../data/liturgy/chrysostom-liturgy.json';
import type { ChrysostomSection, ChrysostomSectionId } from './chrysostomLiturgyTypes';
import { CHRYSOSTOM_SECTION_IDS } from './chrysostomLiturgyTypes';
import { sectionUnits } from './liturgyUnit';

const DEFAULT_URLS = [
  'https://raw.githubusercontent.com/PYastreboff/orthodox-liturgical-app/main/data/liturgy/chrysostom-liturgy.json',
  'https://cdn.jsdelivr.net/gh/PYastreboff/orthodox-liturgical-app@main/data/liturgy/chrysostom-liturgy.json',
] as const;

type LiturgyPayload = {
  version?: number;
  updated?: string;
  source?: string;
  sections: ChrysostomSection[];
};

export type ChrysostomLiturgyState =
  | { status: 'loading'; sections: readonly ChrysostomSection[] }
  | { status: 'ready'; sections: readonly ChrysostomSection[] }
  | { status: 'offline'; sections: readonly ChrysostomSection[]; error: string };

let memoryCache: readonly ChrysostomSection[] | null = null;
let memorySource = '';
let inflight: Promise<readonly ChrysostomSection[]> | null = null;

function libraryUrls(): string[] {
  const override =
    typeof process !== 'undefined' && process.env.EXPO_PUBLIC_LITURGY_LIBRARY_URL?.trim();
  return override ? [override, ...DEFAULT_URLS] : [...DEFAULT_URLS];
}

function isSection(value: unknown): value is ChrysostomSection {
  if (!value || typeof value !== 'object') return false;
  const s = value as ChrysostomSection;
  if (typeof s.id !== 'string' || !CHRYSOSTOM_SECTION_IDS.includes(s.id as ChrysostomSectionId)) {
    return false;
  }
  return sectionUnits(s).length > 0;
}

function parsePayload(data: unknown): { sections: ChrysostomSection[]; source: string } {
  if (!data || typeof data !== 'object') throw new Error('Invalid liturgy library');
  const payload = data as LiturgyPayload;
  const sections = payload.sections;
  if (!Array.isArray(sections) || sections.length === 0) {
    throw new Error('Liturgy library is empty');
  }
  const valid = sections.filter(isSection);
  if (valid.length < CHRYSOSTOM_SECTION_IDS.length) {
    throw new Error('Liturgy library is incomplete');
  }
  return { sections: valid, source: payload.source ?? '' };
}

function hasAlignedUnits(sections: ChrysostomSection[]): boolean {
  return sections.some((section) => (section.units?.length ?? 0) > 0);
}

function payloadVersion(data: LiturgyPayload): number {
  return typeof data.version === 'number' ? data.version : 0;
}

function preferNewerSections(
  current: { sections: ChrysostomSection[]; source: string; version: number },
  candidate: { sections: ChrysostomSection[]; source: string; version: number },
): { sections: ChrysostomSection[]; source: string; version: number } {
  if (!hasAlignedUnits(candidate.sections)) return current;
  if (!hasAlignedUnits(current.sections)) return candidate;
  return candidate.version >= current.version ? candidate : current;
}

export async function fetchChrysostomLiturgy(options?: {
  force?: boolean;
}): Promise<readonly ChrysostomSection[]> {
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

export function getCachedChrysostomLiturgy(): readonly ChrysostomSection[] | null {
  return memoryCache;
}

export function getChrysostomLiturgySource(): string {
  return memorySource;
}
