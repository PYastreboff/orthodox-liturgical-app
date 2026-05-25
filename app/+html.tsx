import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

import { WEB_ROOT_CSS } from '../src/theme/syncWebDocumentTheme';
import { WEB_VIEWPORT_BOOT_SCRIPT } from '../src/theme/webViewport';
import { colors } from '../src/theme/tokens';

/** Web-only root HTML — viewport-fit=cover; iOS shell applied in boot script before paint. */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="description" content="OrthoDaily" />
        <meta name="theme-color" content={colors.parchment} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <title>OrthoDaily</title>
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: WEB_ROOT_CSS }} />
      </head>
      <body>
        {children}
        {/* After body exists — Radford-style cover + bg before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: WEB_VIEWPORT_BOOT_SCRIPT }} />
      </body>
    </html>
  );
}
