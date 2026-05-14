/**
 * 8pt spacing grid (see plan §4.5.1).
 *
 * Touch-target rules (NON-NEGOTIABLE — plan §4.5.2):
 *   - Minimum interactive size: 88dp × 88dp (we double Apple's 44 and Material's 48).
 *   - Recommended primary: 120dp × 120dp.
 *   - Spacing between targets: ≥ 24dp.
 *
 * NO RAW PIXEL VALUES ARE ALLOWED OUTSIDE THIS FILE. ESLint enforces this in components.
 */
export const spacing = {
  1: 8,
  2: 16,
  3: 24,
  4: 32,
  5: 48,
  6: 64,
  7: 96,
} as const;

export type SpacingToken = keyof typeof spacing;

/** Touch target dimensions in dp. */
export const touchTarget = {
  /** Absolute minimum for any interactive element. */
  min: 88,
  /** Recommended size for primary game interactions. */
  primary: 120,
  /** Letter cards in Letter Safari. */
  letterCard: { width: 180, height: 220 },
  /** Shape sorter minimum dimension. */
  shapeMin: 150,
  /** Minimum spacing between adjacent interactive elements. */
  gap: 24,
} as const;

/** Safe zones — see plan §4.5.3. */
export const safeZone = {
  /** Bottom: home-indicator + thumb resting position. */
  bottom: 80,
  /** Top: status bar + camera notch. */
  top: 60,
  /** Corner grip zone (toddlers hold phones by the corners). */
  corner: 40,
} as const;

/** Maximum interactive elements visible on one screen (plan §4.5.4). */
export const MAX_INTERACTIVES_PER_SCREEN = 4;

/** Border-radius scale. Soft, not sharp. */
export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;
