import type { UiLanguage } from '../../i18n/types';
import { fetchJson } from '../net/fetchJson';
import { isSupportedSchema } from '../net/remoteSchema';
import { CHRYSOSTOM_SECTION_IDS, type ChrysostomSection } from './chrysostomLiturgyTypes';
import type { LiturgyUnit } from './liturgyUnit';

/** Highest liturgy `schemaVersion` this binary can render. */
export const LITURGY_SCHEMA_VERSION = 1;

const REPO_PATH = 'PYastreboff/orthodox-liturgical-app';
const LANGS: readonly UiLanguage[] = ['en', 'el', 'ru'];

type Parsed = { sections: ChrysostomSection[]; source: string; version: number };

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isStringList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((line) => typeof line === 'string');

function parseUnit(value: unknown): LiturgyUnit | null {
  if (!isObject(value) || typeof value.en !== 'string') return null;
  return {
    en: value.en,
    ...(typeof value.el === 'string' ? { el: value.el } : null),
    ...(typeof value.ru === 'string' ? { ru: value.ru } : null),
  };
}

function parseSection(value: unknown): ChrysostomSection | null {
  if (!isObject(value)) return null;
  const id = value.id as ChrysostomSection['id'];
  if (!CHRYSOSTOM_SECTION_IDS.includes(id)) return null;

  const units = Array.isArray(value.units)
    ? value.units.map(parseUnit).filter((u): u is LiturgyUnit => u !== null)
    : [];
  if (Array.isArray(value.units) && units.length !== value.units.length) return null;

  const paragraphs: Partial<Record<UiLanguage, string[]>> = {};
  if (isObject(value.paragraphs)) {
    for (const lang of LANGS) {
      const lines = value.paragraphs[lang];
      if (isStringList(lines)) paragraphs[lang] = lines;
    }
  }

  if (units.length > 0) return { id, units };
  if (paragraphs.en?.length) return { id, paragraphs };
  return null;
}

/** Null unless every required section is present and well-formed. */
export function parseLiturgyPayload(data: unknown): Parsed | null {
  if (!isObject(data) || !isSupportedSchema(data, LITURGY_SCHEMA_VERSION)) return null;
  if (!Array.isArray(data.sections)) return null;
  const sections = data.sections.map(parseSection);
  if (sections.some((s) => s === null)) return null;
  const valid = sections as ChrysostomSection[];
  if (!CHRYSOSTOM_SECTION_IDS.every((id) => valid.some((s) => s.id === id))) return null;
  return {
    sections: valid,
    source: typeof data.source === 'string' ? data.source : '',
    version: typeof data.version === 'number' ? data.version : 0,
  };
}

const hasAlignedUnits = (sections: ChrysostomSection[]) =>
  sections.some((section) => (section.units?.length ?? 0) > 0);

function preferNewer(current: Parsed, candidate: Parsed): Parsed {
  if (!hasAlignedUnits(candidate.sections)) return current;
  if (!hasAlignedUnits(current.sections)) return candidate;
  return candidate.version >= current.version ? candidate : current;
}

/**
 * Loader for a liturgy JSON in `data/liturgy/`: bundled copy first, replaced by the
 * GitHub `main` copy only when it validates and is at least as new.
 */
export function createLiturgyLoader(options: { bundled: unknown; fileName: string }) {
  let memoryCache: readonly ChrysostomSection[] | null = null;
  let memorySource = '';
  let inflight: Promise<readonly ChrysostomSection[]> | null = null;

  const urls = (): string[] => {
    const override =
      typeof process !== 'undefined' && process.env.EXPO_PUBLIC_LITURGY_LIBRARY_URL?.trim();
    const defaults = [
      `https://raw.githubusercontent.com/${REPO_PATH}/main/data/liturgy/${options.fileName}`,
      `https://cdn.jsdelivr.net/gh/${REPO_PATH}@main/data/liturgy/${options.fileName}`,
    ];
    return override ? [override, ...defaults] : defaults;
  };

  async function fetchLiturgy(fetchOptions?: {
    force?: boolean;
  }): Promise<readonly ChrysostomSection[]> {
    if (!fetchOptions?.force && memoryCache) return memoryCache;
    if (inflight) return inflight;

    inflight = (async () => {
      try {
        const bundled = parseLiturgyPayload(options.bundled);
        if (!bundled) throw new Error(`Bundled ${options.fileName} is invalid`);
        let best: Parsed = { ...bundled, source: bundled.source || 'Bundled liturgy library' };

        for (const url of urls()) {
          try {
            const remote = parseLiturgyPayload(await fetchJson(url, { timeoutMs: 20000 }));
            if (!remote) continue;
            best = preferNewer(best, remote);
            break;
          } catch {
            // try next mirror
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

  return {
    fetchLiturgy,
    getCached: (): readonly ChrysostomSection[] | null => memoryCache,
    getSource: (): string => memorySource,
  };
}
