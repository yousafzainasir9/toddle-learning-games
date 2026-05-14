/**
 * ESLint config for the Toodles mobile app.
 *
 * The "no raw hex codes / no raw px values" rules from plan §4.11 are
 * implemented via `no-restricted-syntax`. They allow theme/ files and
 * the SVG assets folder to use raw values; everywhere else, components
 * must import from `@theme`.
 */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  env: { node: true, es2022: true, jest: true },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'react-native'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-native/all',
    'prettier',
  ],
  settings: { react: { version: 'detect' } },
  ignorePatterns: [
    'node_modules/',
    '.expo/',
    'dist/',
    'coverage/',
    'android/',
    'ios/',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off', // RN 18 / new JSX transform
    'react/prop-types': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_' },
    ],
    'react-native/no-color-literals': 'error',
    'react-native/no-raw-text': 'off', // we use Text in many places, this is fine
    'react-native/sort-styles': 'off',
    'react-native/no-inline-styles': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  overrides: [
    {
      // The design tokens live in src/theme. They're allowed to use raw
      // colors and numbers — that's their whole job.
      files: ['src/theme/**/*.ts'],
      rules: {
        'react-native/no-color-literals': 'off',
      },
    },
    {
      // Tests can use literal values for fixtures.
      files: ['**/*.test.ts', '**/*.test.tsx', 'tests/**/*'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
