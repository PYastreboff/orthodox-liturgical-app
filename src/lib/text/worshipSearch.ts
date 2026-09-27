import { translate } from '../../i18n/translate';
import {
  liturgyRoleLabelKey,
  parseLiturgyLine,
} from '../liturgy/parseLiturgyLine';
import type { LiturgyTextLang } from '../liturgy/liturgyViewMode';
import { countMatchesInLines } from './highlightMatches';

export type WorshipLineEntry = {
  key: string;
  line: string;
  lang: LiturgyTextLang;
};

/** Searchable text segments in the same order LiturgyLine renders them. */
export function getLiturgyLineSearchSegments(
  line: string,
  lang: LiturgyTextLang,
): string[] {
  const parsed = parseLiturgyLine(line, lang);
  const roleLabel = (role: Parameters<typeof liturgyRoleLabelKey>[0]) =>
    translate(lang, liturgyRoleLabelKey(role));

  switch (parsed.kind) {
    case 'banner':
      return parsed.text ? [parsed.text] : [];
    case 'heading':
      return [parsed.text];
    case 'role-only': {
      const segments = [roleLabel(parsed.role)];
      if (parsed.direction) segments.push(parsed.direction);
      return segments;
    }
    case 'role-speech':
      return [roleLabel(parsed.role), parsed.speech];
    case 'rubric':
      return [parsed.text];
    case 'devotional': {
      if (parsed.variant === 'title') {
        const title = parsed.titleKey ? translate(lang, parsed.titleKey) : parsed.text;
        return title ? [title] : [];
      }
      return [parsed.text];
    }
    case 'speech':
      return parsed.text ? [parsed.text] : [];
    default:
      return [];
  }
}

export function countLineSearchMatches(line: string, lang: LiturgyTextLang, query: string): number {
  if (!query) return 0;
  return countMatchesInLines(getLiturgyLineSearchSegments(line, lang), query);
}

export type WorshipSearchPlan = {
  total: number;
  /** Line key to scroll to for each global match index. */
  lineKeys: string[];
  /** Global match index where each line's highlights begin. */
  offsets: Record<string, number>;
  /** Number of matches in each line. */
  counts: Record<string, number>;
};

export function buildWorshipSearchPlan(
  entries: readonly WorshipLineEntry[],
  query: string,
): WorshipSearchPlan {
  const lineKeys: string[] = [];
  const offsets: Record<string, number> = {};
  const counts: Record<string, number> = {};
  let cursor = 0;

  for (const entry of entries) {
    offsets[entry.key] = cursor;
    const count = countLineSearchMatches(entry.line, entry.lang, query);
    counts[entry.key] = count;
    for (let index = 0; index < count; index += 1) {
      lineKeys.push(entry.key);
    }
    cursor += count;
  }

  return { total: cursor, lineKeys, offsets, counts };
}

export type LineSearchProps = {
  searchQuery: string;
  activeMatchIndex: number | null;
  matchIndexOffset: number;
};

const NO_LINE_SEARCH: LineSearchProps = { searchQuery: '', activeMatchIndex: null, matchIndexOffset: 0 };

/**
 * Search props for one rendered line, narrowed so lines without matches get
 * identical values and memoized rows skip re-rendering while typing or
 * stepping between matches.
 */
export function lineSearchProps(
  lineKey: string,
  searchQuery: string,
  activeMatchIndex: number | null,
  plan: WorshipSearchPlan | null,
): LineSearchProps {
  const count = plan?.counts[lineKey] ?? 0;
  if (!searchQuery || count === 0) return NO_LINE_SEARCH;
  const offset = plan?.offsets[lineKey] ?? 0;
  const active =
    activeMatchIndex !== null && activeMatchIndex >= offset && activeMatchIndex < offset + count
      ? activeMatchIndex
      : null;
  return { searchQuery, activeMatchIndex: active, matchIndexOffset: offset };
}
