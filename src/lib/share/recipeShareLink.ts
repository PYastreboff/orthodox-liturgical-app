import { getAppWebBaseUrl } from './shareBaseUrl';

export type RecipeShareTextInput = {
  recipeId: string;
  title: string;
  /** e.g. "45 min · Medium" */
  detailLine?: string;
  /** Route prefix without trailing slash (default `/recipes`). */
  shareBasePath?: string;
};

export function buildRecipeShareUrl(
  recipeId: string,
  shareBasePath = '/recipes',
): string {
  const base = getAppWebBaseUrl().replace(/\/$/, '');
  const segment = shareBasePath.replace(/^\/|\/$/g, '');
  const id = encodeURIComponent(recipeId);
  return `${base}/${segment}/${id}`;
}

export function buildRecipeShareBody(input: RecipeShareTextInput, appName: string): string {
  const lines = [appName, input.title.trim()];
  const detail = input.detailLine?.trim();
  if (detail) lines.push(detail);
  return lines.join('\n');
}

export function buildRecipeShareMessage(input: RecipeShareTextInput, appName: string): string {
  const basePath = input.shareBasePath ?? '/recipes';
  return `${buildRecipeShareBody(input, appName)}\n${buildRecipeShareUrl(input.recipeId, basePath)}`;
}
