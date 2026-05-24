import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

import { WEB_ROOT_CSS } from '../src/theme/syncWebDocumentTheme';
import { WEB_VIEWPORT_BOOT_SCRIPT } from '../src/theme/webViewport';
import { colors } from '../src/theme/tokens';

/** Web-only root HTML — viewport-fit=cover; shell CSS must load after ScrollViewStyleReset. */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="description" content="OrthoDaily" />
        <meta name="theme-color" content={colors.parchment} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <title>OrthoDaily</title>
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: WEB_ROOT_CSS }} />
        <script dangerouslySetInnerHTML={{ __html: WEB_VIEWPORT_BOOT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
