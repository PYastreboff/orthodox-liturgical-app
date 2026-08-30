import type { ReactNode } from 'react';
import { Text } from 'react-native';

export function countSearchMatches(text: string, query: string): number {
  if (!query) return 0;
  const lower = text.toLowerCase();
  const needle = query.toLowerCase();
  let count = 0;
  let position = 0;
  while ((position = lower.indexOf(needle, position)) !== -1) {
    count += 1;
    position += needle.length;
  }
  return count;
}

export function countMatchesInLines(lines: readonly string[], query: string): number {
  return lines.reduce((total, line) => total + countSearchMatches(line, query), 0);
}

type HighlightOptions = {
  highlightColor: string;
  activeHighlightColor: string;
  activeMatchIndex: number | null;
  matchIndexStart: number;
};

/** Split text into plain and highlighted spans (Ctrl+F style — full text stays visible). */
export function highlightMatches(
  text: string,
  query: string,
  options: HighlightOptions,
): { nodes: ReactNode; nextMatchIndex: number } {
  if (!query) {
    return { nodes: text, nextMatchIndex: options.matchIndexStart };
  }

  const lower = text.toLowerCase();
  const needle = query.toLowerCase();
  const parts: ReactNode[] = [];
  let start = 0;
  let index = lower.indexOf(needle, start);
  let matchCursor = options.matchIndexStart;

  while (index !== -1) {
    if (index > start) {
      parts.push(text.slice(start, index));
    }
    const isActive = options.activeMatchIndex === matchCursor;
    parts.push(
      <Text
        key={`${index}-${start}`}
        nativeID={isActive ? `worship-search-match-${matchCursor}` : undefined}
        style={{
          backgroundColor: isActive ? options.activeHighlightColor : options.highlightColor,
        }}
      >
        {text.slice(index, index + needle.length)}
      </Text>,
    );
    matchCursor += 1;
    start = index + needle.length;
    index = lower.indexOf(needle, start);
  }

  if (start < text.length) {
    parts.push(text.slice(start));
  }

  return {
    nodes: parts.length === 1 ? parts[0] : parts,
    nextMatchIndex: matchCursor,
  };
}
