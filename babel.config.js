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
      // Reanimated plugin MUST be listed last
      'react-native-reanimated/plugin',
    ],
  };
};
