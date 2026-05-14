/**
 * Toodles typography (see plan §4.3).
 *
 * Three fonts, picked for friendliness over neutrality:
 *   - Quicksand   — soft rounded geometric sans (primary)
 *   - Fredoka     — chunky friendly display (celebrations)
 *   - Andika      — early-literacy font with single-story `a`/`g`
 *                   and clearly distinguishable `b/d/p/q`. USED FOR LETTER
 *                   CARDS — default geometric sans confuses early readers.
 *
 * BODY TEXT BELOW 16px IS FORBIDDEN. There's no scenario where small text
 * serves the child.
 */
export const fonts = {
  primary: 'Quicksand',
  display: 'Fredoka',
  letterTeach: 'Andika',
} as const;

export type FontFamily = (typeof fonts)[keyof typeof fonts];

export type TypeStyle = {
  fontFamily: FontFamily;
  fontSize: number;
  /**
   * React Native expects fontWeight as a string ('400', '500', '600', '700').
   */
  fontWeight: '400' | '500' | '600' | '700';
  lineHeight: number;
};

/**
 * Type scale — plan §4.3.2.
 *
 * Sizes are unitless dp values. Components must pull style objects from this
 * map; raw fontSize numbers are banned by lint.
 */
export const type: Record<string, TypeStyle> = {
  display: {
    fontFamily: fonts.display,
    fontSize: 96,
    fontWeight: '600',
    lineHeight: 104,
  },
  gameTitle: {
    fontFamily: fonts.display,
    fontSize: 48,
    fontWeight: '500',
    lineHeight: 56,
  },
  prompt: {
    fontFamily: fonts.primary,
    fontSize: 32,
    fontWeight: '600',
    lineHeight: 40,
  },
  /** Letter card glyph (e.g., a giant `B`). MUST use Andika. */
  letterHuge: {
    fontFamily: fonts.letterTeach,
    fontSize: 200,
    fontWeight: '700',
    lineHeight: 220,
  },
  body: {
    fontFamily: fonts.primary,
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 28,
  },
  /** Parent-only info. Children never see anything smaller. */
  caption: {
    fontFamily: fonts.primary,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
} as const;

export type TypeStyleKey = keyof typeof type;
