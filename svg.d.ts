/**
 * Allow importing SVG files as React components.
 * Requires `react-native-svg-transformer` configured in metro.config.js.
 */
declare module '*.svg' {
  import type React from 'react';
  import type { SvgProps } from 'react-native-svg';
  const content: React.ComponentType<SvgProps>;
  export default content;
}
