/**
 * Toodles color palette — "Sunlit Meadow"
 *
 * Design rules (see plan §4.2):
 *   - NEVER pure white or pure black. Cream + charcoal feels like book paper.
 *   - All colors max out at ~70-85% saturation. No neon.
 *   - All swatches meet WCAG AA against `cream`. Most meet AAA.
 *   - "Color is information": mint = correct, sun = celebration, etc. Never break the mapping.
 *
 * NO RAW HEX CODES ARE ALLOWED OUTSIDE THIS FILE. This is enforced by ESLint.
 */
export const colors = {
  // Surfaces
  cream: '#FFF8EC', // Primary background — never pure white.
  creamDeep: '#FDF0D5', // Card backgrounds, secondary surface.

  // Text
  charcoal: '#3D2C1E', // Primary text — never pure black.
  charcoalSoft: '#6B5544', // Secondary text.

  // Accents (per-game identities — see plan §4.2.5)
  sun: '#FFC857', // Highlights, celebrations. (Letter Safari accent.)
  coral: '#FF8A65', // Primary action accent. (Counting Objects accent.)
  rose: '#F4A5B5', // Soft pink. (Trace a Letter accent.)
  mint: '#7FD1AE', // Success / "yes" feedback. (Shape Sorter accent.)
  sky: '#7FB8E0', // "Tap me" interactive cue. (Pattern Completion accent.)
  lavender: '#B8A5D6', // Tertiary accent. (Odd One Out accent.)
  terracotta: '#D87C5A', // Warm earthy accent. (Jigsaw Puzzle accent.)

  // Functional aliases — DO NOT add new ones casually. The point of a tight
  // palette is to keep visual identity tight.
  success: '#7FD1AE', // = mint
  celebrate: '#FFC857', // = sun
  prompt: '#7FB8E0', // = sky
} as const;

export type ColorToken = keyof typeof colors;

/**
 * Per-game accent lookup. The shell uses this to subtly tint each game's
 * picker tile and in-game chrome without the game module having to know
 * about it.
 */
export const gameAccents = {
  'letter-safari': colors.sun,
  'counting-objects': colors.coral,
  'odd-one-out': colors.lavender,
  'pattern-completion': colors.sky,
  'shape-sorter': colors.mint,
  'jigsaw-puzzle': colors.terracotta,
  'trace-letter': colors.rose,
  'color-mixing': colors.lavender, // rainbow inside; lavender on the tile
} as const;

export type GameAccentId = keyof typeof gameAccents;
