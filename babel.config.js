module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@theme': './src/theme',
            '@core': './src/core',
            '@platform': './src/platform',
            '@shared-ui': './src/shared-ui',
            '@games': './src/games',
            '@shell': './src/shell',
            '@assets': './assets',
          },
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        },
      ],
      // Reanimated 4 (SDK 55+) moved its babel plugin into a separate
      // `react-native-worklets` package. The plugin MUST still be listed last.
      'react-native-worklets/plugin',
    ],
  };
};
