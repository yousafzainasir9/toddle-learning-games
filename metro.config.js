// Metro bundler configuration.
//
// We tweak the default Expo config to:
//   1. Treat .svg as a source file (transformed to React components by
//      `react-native-svg-transformer`) instead of an asset.
//   2. Strip `cjs` from sourceExts (Expo Router already adds it).
//
// If you add new file extensions, update this file and tsconfig paths.
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
};

config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...resolver.sourceExts, 'svg'],
};

module.exports = config;
