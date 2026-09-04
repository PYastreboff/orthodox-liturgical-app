/**
 * Bundled Vespers liturgy text.
 */
import bundledLiturgy from '../../../data/liturgy/vespers-liturgy.json';
import { VESPERS_SECTION_IDS, type VespersSection, type VespersSectionId } from './vespersLiturgy';
import { sectionUnits } from './liturgyUnit';

export type VespersLiturgyState =
  | { status: 'loading'; sections: readonly VespersSection[] }
  | { status: 'ready'; sections: readonly VespersSection[] }
  | { status: 'offline'; sections: readonly VespersSection[]; error: string };

let memoryCache: readonly VespersSection[] | null = null;

function isSection(value: unknown): value is VespersSection {
  if (!value || typeof value !== 'object') return false;
  const section = value as VespersSection;
  if (typeof section.id !== 'string' || !VESPERS_SECTION_IDS.includes(section.id as VespersSectionId)) {
    return false;
  }
  return sectionUnits(section).length > 0;
}

function parsePayload(data: unknown): VespersSection[] {
  if (!data || typeof data !== 'object') throw new Error('Invalid vespers library');
  const sections = (data as { sections?: unknown }).sections;
  if (!Array.isArray(sections) || sections.length === 0) {
    throw new Error('Vespers library is empty');
  }
  const valid = sections.filter(isSection);
  if (valid.length < VESPERS_SECTION_IDS.length) {
    throw new Error('Vespers library is incomplete');
  }
  return valid;
}

export async function fetchVespersLiturgy(): Promise<readonly VespersSection[]> {
  if (memoryCache) return memoryCache;
  const sections = parsePayload(bundledLiturgy);
  memoryCache = sections;
  return sections;
}

export function getCachedVespersLiturgy(): readonly VespersSection[] | null {
  return memoryCache;
}
