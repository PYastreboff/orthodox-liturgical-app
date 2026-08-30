import {
  isOpeningDeaconBlessing,
  lineKind,
  lineRole,
  type LiturgyUnit,
} from '../../src/lib/liturgy/liturgyUnit.ts';
import type { LiturgyRole } from '../../src/lib/liturgy/parseLiturgyLine.ts';
import type { UiLanguage } from '../../src/i18n/types.ts';
import { splitRussianRoles } from './parseLiturgySource.ts';

const RU_ROLE_INLINE = /(?=\b(?:Священник|Диакон|Чтец|Народ|Хор|Сослужащие)\s*:)/gi;

function expandMultilineRoles(lines: string[], lang: UiLanguage): string[] {
  if (lang !== 'ru') return lines;
  return lines.flatMap((line) => {
    if (RU_ROLE_INLINE.test(line)) {
      RU_ROLE_INLINE.lastIndex = 0;
      const parts = splitRussianRoles(line);
      return parts.length > 1 ? parts : [line];
    }
    RU_ROLE_INLINE.lastIndex = 0;
    return [line];
  });
}

function shouldMergeWithPrevious(prev: string, current: string, lang: UiLanguage): boolean {
  if (lineRole(current, lang)) return false;
  const currentKind = lineKind(current, lang);
  if (currentKind === 'heading' || currentKind === 'banner') return false;
  if (/^(DEACON|PRIEST|CHOIR|PEOPLE|READER|ΔΙΑΚΟΝΟΣ|ΙΕΡΕΥΣ|ΧΟΡΟΣ|ΛΑΟΣ|Священник|Диакон|Хор|Народ)\b/i.test(current)) {
    return false;
  }

  const prevKind = lineKind(prev, lang);
  if (prevKind === 'role-only') return true;
  if (lineRole(prev, lang) && !/[:.!?]$/.test(prev.trim())) return true;
  if (/^[a-zа-яё('"«(\[]/i.test(current.trim())) return true;
  return false;
}

export function mergeLiturgyLines(lines: string[], lang: UiLanguage): string[] {
  const expanded = expandMultilineRoles(lines, lang);
  const merged: string[] = [];
  for (const line of expanded) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const prev = merged[merged.length - 1];
    if (prev && shouldMergeWithPrevious(prev, trimmed, lang)) {
      merged[merged.length - 1] = `${prev} ${trimmed}`;
    } else {
      merged.push(trimmed);
    }
  }
  return merged;
}

type RoleKey = `${LiturgyRole | 'speech' | 'devotional'}:${number}`;

function lineRoleKey(line: string, lang: UiLanguage): LiturgyRole | 'speech' | 'devotional' {
  const role = lineRole(line, lang);
  if (role) return role;
  if (line.includes('__CREED_TITLE__') || line.includes('__LORDS_PRAYER_TITLE__')) return 'devotional';
  const kind = lineKind(line, lang);
  if (kind === 'devotional') return 'devotional';
  return 'speech';
}

function indexLinesByRole(lines: string[], lang: UiLanguage): Map<RoleKey, string[]> {
  const counts = new Map<LiturgyRole | 'speech' | 'devotional', number>();
  const buckets = new Map<RoleKey, string[]>();

  for (const line of lines) {
    const role = lineRoleKey(line, lang);
    const index = counts.get(role) ?? 0;
    counts.set(role, index + 1);
    const key = `${role}:${index}` as RoleKey;
    const bucket = buckets.get(key) ?? [];
    bucket.push(line);
    buckets.set(key, bucket);
  }

  return buckets;
}

function takeFromBucket(buckets: Map<RoleKey, string[]>, key: RoleKey): string | undefined {
  const bucket = buckets.get(key);
  if (!bucket?.length) return undefined;
  return bucket.shift();
}

function findNextRoleLine(
  lines: string[],
  lang: UiLanguage,
  role: LiturgyRole,
  from: number,
): number {
  if (from === 0 && role === 'deacon') {
    for (let i = from; i < Math.min(lines.length, from + 2); i++) {
      if (isOpeningDeaconBlessing(lines[i]!, lang) || lineRole(lines[i]!, lang) === 'deacon') {
        return i;
      }
    }
  }

  for (let i = from; i < lines.length; i++) {
    if (lineRole(lines[i]!, lang) === role) return i;
  }
  return -1;
}

function takeAt(lines: string[], index: number): string | undefined {
  return index >= 0 && index < lines.length ? lines[index] : undefined;
}

function advance(ptr: number, index: number): number {
  return index >= 0 ? index + 1 : ptr;
}

/** Align EL/RU lines to the English spine for side-by-side display. */
export function alignLiturgySection(
  enLines: string[],
  ruLines: string[],
  elLines: string[],
): LiturgyUnit[] {
  const en = mergeLiturgyLines(enLines, 'en');
  const ru = mergeLiturgyLines(ruLines, 'ru');
  const el = mergeLiturgyLines(elLines, 'el');

  const ruBuckets = indexLinesByRole(ru, 'ru');
  const elBuckets = indexLinesByRole(el, 'el');

  let ruPtr = 0;
  let elPtr = 0;
  const units: LiturgyUnit[] = [];
  const roleCounts = new Map<LiturgyRole | 'speech' | 'devotional', number>();

  for (const enLine of en) {
    const role = lineRoleKey(enLine, 'en');
    const roleIndex = roleCounts.get(role) ?? 0;
    roleCounts.set(role, roleIndex + 1);
    const key = `${role}:${roleIndex}` as RoleKey;

    let ruLine = takeFromBucket(ruBuckets, key);
    let elLine = takeFromBucket(elBuckets, key);

    if (!ruLine || !elLine) {
      const enRole = lineRole(enLine, 'en');
      if (enRole) {
        const ruIdx = findNextRoleLine(ru, 'ru', enRole, ruPtr);
        const elIdx = findNextRoleLine(el, 'el', enRole, elPtr);
        if (!ruLine) ruLine = takeAt(ru, ruIdx);
        if (!elLine) elLine = takeAt(el, elIdx);
        ruPtr = advance(ruPtr, ruIdx);
        elPtr = advance(elPtr, elIdx);
      } else {
        if (!ruLine && ruPtr < ru.length) {
          ruLine = ru[ruPtr];
          ruPtr++;
        }
        if (!elLine && elPtr < el.length) {
          elLine = el[elPtr];
          elPtr++;
        }
      }
    }

    units.push({
      en: enLine,
      ru: ruLine,
      el: elLine,
    });
  }

  return units;
}
