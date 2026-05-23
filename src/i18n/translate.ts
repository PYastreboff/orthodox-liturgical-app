import { messages, type MessageTree } from './messages';
import type { UiLanguage } from './types';

function getPath(tree: MessageTree, path: string): string | undefined {
  let node: unknown = tree;
  for (const part of path.split('.')) {
    if (node && typeof node === 'object' && part in node) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof node === 'string' ? node : undefined;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    return value !== undefined ? String(value) : `{${key}}`;
  });
}

export function translate(
  lang: UiLanguage,
  path: string,
  params?: Record<string, string | number>,
): string {
  const text = getPath(messages[lang], path) ?? getPath(messages.en, path) ?? path;
  return interpolate(text, params);
}
