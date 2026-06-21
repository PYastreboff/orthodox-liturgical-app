/** Accent-insensitive, lower-case text for matching saint / feast names. */
export function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

function queryTokens(query: string): string[] {
  return normalizeSearchText(query).split(/\s+/).filter((token) => token.length >= 2);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const prev = new Array<number>(b.length + 1);
  const curr = new Array<number>(b.length + 1);

  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }

  return prev[b.length];
}

/** Characters of needle appear in order within hay — rewards compact matches. */
function subsequenceScore(hay: string, needle: string): number {
  let hayIdx = 0;
  let gaps = 0;
  let consecutive = 0;
  let maxConsecutive = 0;

  for (let i = 0; i < needle.length; i++) {
    const ch = needle[i];
    let found = false;
    while (hayIdx < hay.length) {
      if (hay[hayIdx] === ch) {
        consecutive++;
        maxConsecutive = Math.max(maxConsecutive, consecutive);
        hayIdx++;
        found = true;
        break;
      }
      if (consecutive > 0) consecutive = 0;
      gaps++;
      hayIdx++;
    }
    if (!found) return 0;
  }

  const compactness = needle.length / (needle.length + gaps);
  return 100 + compactness * 120 + maxConsecutive * 8;
}

function typoScore(a: string, b: string): number {
  if (a.length < 2 || b.length < 2) return 0;
  const maxDistance =
    b.length <= 4 ? 1 : b.length <= 7 ? 2 : Math.min(3, Math.floor(b.length / 4));
  const distance = levenshtein(a, b);
  if (distance > maxDistance) return 0;
  return 180 - distance * 45;
}

function wordPrefixScore(word: string, needle: string): number {
  if (word.startsWith(needle)) {
    return 680 + (needle.length / word.length) * 60;
  }
  if (needle.length < 3 || word.length < needle.length) return 0;

  const prefix = word.slice(0, needle.length);
  const prefixTypo = typoScore(prefix, needle);
  if (prefixTypo > 0) {
    return Math.max(520, prefixTypo) + (needle.length / word.length) * 30;
  }

  return subsequenceScore(word, needle);
}

/** Higher = better match. Zero means no match. */
export function fuzzyMatchScore(text: string, query: string): number {
  const hay = normalizeSearchText(text);
  const needle = normalizeSearchText(query);
  if (!needle || !hay) return 0;

  if (hay === needle) return 1000;

  if (hay.startsWith(needle)) {
    return 850 + (needle.length / hay.length) * 100;
  }

  const words = hay.split(/[^a-z0-9]+/).filter(Boolean);
  let bestWordPrefix = 0;
  let bestWordExact = 0;
  let bestTypo = 0;

  for (const word of words) {
    if (word.length < 2) continue;
    if (word === needle) bestWordExact = Math.max(bestWordExact, 780);
    bestWordPrefix = Math.max(bestWordPrefix, wordPrefixScore(word, needle));
    if (Math.abs(word.length - needle.length) <= 3) {
      const shorter = word.length <= needle.length ? word : needle;
      const longer = word.length <= needle.length ? needle : word;
      bestTypo = Math.max(bestTypo, typoScore(shorter, longer));
    }
  }

  if (bestWordExact > 0) return bestWordExact;
  if (bestWordPrefix > 0) return bestWordPrefix;

  const index = hay.indexOf(needle);
  if (index >= 0) {
    return 520 - Math.min(index, 80) + needle.length * 2;
  }

  const subsequence = subsequenceScore(hay, needle);
  if (subsequence > 0) return subsequence;

  return bestTypo;
}

/** Score a commemoration name against a multi-word query. */
export function fuzzyNameScore(name: string, query: string): number {
  const trimmed = query.trim();
  if (trimmed.length < 2) return 0;

  const tokens = queryTokens(trimmed);
  if (tokens.length === 0) return 0;

  let tokenTotal = 0;
  for (const token of tokens) {
    const tokenScore = fuzzyMatchScore(name, token);
    if (tokenScore <= 0) return 0;
    tokenTotal += tokenScore;
  }

  let score = tokenTotal / tokens.length;
  const phraseScore = fuzzyMatchScore(name, trimmed);
  if (phraseScore > 0) {
    score = Math.max(score, phraseScore);
    if (tokens.length > 1) score += phraseScore * 0.15;
  }

  return score;
}
