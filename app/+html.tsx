import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/** Web-only root HTML — tab title and meta description for browsers. */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="description" content="OrthoDaily" />
        <title>OrthoDaily</title>
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
