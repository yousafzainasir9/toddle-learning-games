/**
 * Web-only HTML template for Expo Router.
 *
 * This file is read ONLY when bundling for web. On iOS/Android it's
 * ignored. Its single job is to make sure `html`, `body`, and `#root`
 * have height: 100% so that `<View style={{flex: 1}}>` actually has
 * pixels to fill — without this, RN-Web collapses every flex layout to
 * zero height and the page renders blank.
 *
 * Other bits we set here:
 *   - Cream background, matching the in-app theme so there's no flash
 *     of white during boot.
 *   - Touch-friendly viewport (no zoom — toddlers will pinch).
 *   - Antialiased text.
 */
import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren): JSX.Element {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no"
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: rootCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const rootCss = `
  html, body, #root {
    height: 100%;
    margin: 0;
    padding: 0;
  }
  body {
    background-color: #FFF8EC; /* theme: --cream */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow: hidden;
  }
  #root {
    display: flex;
  }
`;
