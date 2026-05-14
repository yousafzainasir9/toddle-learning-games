/**
 * Toodles design system — single source of truth.
 *
 * Import patterns:
 *   import { colors, spacing, type, motion } from '@theme';
 *
 * Lint rules forbid raw hex codes, raw font sizes, and raw px values in
 * component code. Everything routes through this module.
 */
export {
  colors,
  gameAccents,
  type ColorToken,
  type GameAccentId,
} from './colors';
export {
  spacing,
  touchTarget,
  safeZone,
  radius,
  MAX_INTERACTIVES_PER_SCREEN,
  type SpacingToken,
} from './spacing';
export {
  fonts,
  type,
  type FontFamily,
  type TypeStyle,
  type TypeStyleKey,
} from './typography';
export {
  motion,
  celebrationTimeline,
  MAX_FLASH_HZ,
  type MotionToken,
  type MotionTokenKey,
  type TimingMotion,
  type SpringMotion,
} from './motion';
