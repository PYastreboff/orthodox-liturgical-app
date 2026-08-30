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

/** Split text into plain and highlighted spans (Ctrl+F style — full text stays visible). */
export function highlightMatches(
  text: string,
  query: string,
  highlightColor: string,
): ReactNode {
  if (!query) return text;

  const lower = text.toLowerCase();
  const needle = query.toLowerCase();
  const parts: ReactNode[] = [];
  let start = 0;
  let index = lower.indexOf(needle, start);

  while (index !== -1) {
    if (index > start) {
      parts.push(text.slice(start, index));
    }
    parts.push(
      <Text key={`${index}-${start}`} style={{ backgroundColor: highlightColor }}>
        {text.slice(index, index + needle.length)}
      </Text>,
    );
    start = index + needle.length;
    index = lower.indexOf(needle, start);
  }

  if (start < text.length) {
    parts.push(text.slice(start));
  }

  return parts.length === 1 ? parts[0] : parts;
}
