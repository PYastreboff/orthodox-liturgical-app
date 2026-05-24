import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

import { colors } from '../src/theme/tokens';

const WEB_ROOT_STYLES = `
html {
  height: 100%;
  background-color: ${colors.darkBg};
}
body {
  height: 100%;
  margin: 0;
  overflow: hidden;
  background-color: ${colors.darkBg};
}
#root {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 100%;
  min-height: 100dvh;
  background-color: ${colors.darkBg};
}
`;

/** Web-only root HTML — viewport, safe areas, and theme-colored gutters for iPhone notch/home bar. */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="description" content="OrthoDaily" />
        <meta name="theme-color" content={colors.darkBg} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <title>OrthoDaily</title>
        <style dangerouslySetInnerHTML={{ __html: WEB_ROOT_STYLES }} />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
