import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

import { WEB_ROOT_CSS } from '../src/theme/syncWebDocumentTheme';
import { colors } from '../src/theme/tokens';

/** Web-only root HTML — viewport-fit=cover; shell CSS applied in WebViewportBootstrap. */
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
        <style dangerouslySetInnerHTML={{ __html: WEB_ROOT_CSS }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var n=window.navigator;var s=n.standalone===true||window.matchMedia('(display-mode: standalone)').matches;if(s){document.documentElement.style.setProperty('--app-height','100vh');}}catch(e){}})();`,
          }}
        />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
