/** Public origin of the hosted web app (GitHub Pages); path comes from Expo `baseUrl`. */
export const DEFAULT_WEB_ORIGIN = 'https://pyastreboff.github.io';

/**
 * App root URL for shared links: origin + Expo `baseUrl`, never the current page path.
 * On web the running origin is used; `basePath` is only kept when the page is actually
 * served under it (the dev server serves from `/`).
 */
export function buildAppWebBaseUrl(input: {
  basePath?: string;
  webOrigin?: string;
  webPathname?: string;
}): string {
  const basePath = (input.basePath ?? '').replace(/\/+$/, '');
  if (input.webOrigin) {
    const pathname = input.webPathname ?? '';
    const servedUnderBase =
      basePath !== '' && (pathname === basePath || pathname.startsWith(`${basePath}/`));
    return `${input.webOrigin}${servedUnderBase ? basePath : ''}`;
  }
  return `${DEFAULT_WEB_ORIGIN}${basePath}`;
}
