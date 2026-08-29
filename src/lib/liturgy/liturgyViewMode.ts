export type LiturgyTextLang = 'en' | 'el' | 'ru';

export type LiturgyDisplayMode =
  | { kind: 'single'; lang: LiturgyTextLang }
  | { kind: 'compare'; left: LiturgyTextLang | null; right: LiturgyTextLang | null };

export function liturgyDisplayLangs(mode: LiturgyDisplayMode): LiturgyTextLang[] {
  if (mode.kind === 'single') return [mode.lang];
  const langs: LiturgyTextLang[] = [];
  if (mode.left) langs.push(mode.left);
  if (mode.right && mode.right !== mode.left) langs.push(mode.right);
  return langs;
}

export function liturgyCompareHasSelection(mode: LiturgyDisplayMode): boolean {
  return mode.kind === 'compare' && (mode.left != null || mode.right != null);
}

export function liturgyCompareReady(mode: LiturgyDisplayMode): boolean {
  return mode.kind === 'compare' && mode.left != null && mode.right != null;
}
