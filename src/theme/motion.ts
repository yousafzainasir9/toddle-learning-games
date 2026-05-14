/**
 * Motion tokens (see plan §4.6).
 *
 * Rules:
 *   - Animation is REWARD + BREATHING + FEEDBACK. Never decoration.
 *   - No jitter, no shake. Photosensitivity-banned (forbidden).
 *   - No strobing > 3 Hz, ever. Verified in pre-release QA.
 *   - Reanimated only. JS-thread animations are banned.
 *
 * The shape of these tokens is intentionally library-neutral. Components
 * translate `spring` configs into `withSpring(...)` and `timing` configs
 * into `withTiming(...)` themselves.
 */

export type TimingMotion = {
  kind: 'timing';
  duration: number; // ms
  /** Reanimated easing identifier. Resolved at the component layer. */
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'sin';
};

export type SpringMotion = {
  kind: 'spring';
  damping: number;
  /** Optional stiffness override. */
  stiffness?: number;
};

export type MotionToken = TimingMotion | SpringMotion;

export const motion: Record<string, MotionToken> = {
  /** Tap acknowledgment. */
  instant: { kind: 'timing', duration: 100, easing: 'ease-out' },
  /** Button press response. */
  quick: { kind: 'timing', duration: 200, easing: 'ease-out' },
  /** Card transitions. */
  smooth: { kind: 'spring', damping: 15 },
  /** Celebrations. */
  playful: { kind: 'spring', damping: 10 },
  /** Mascot idle breath. */
  breath: { kind: 'timing', duration: 2400, easing: 'sin' },
} as const;

export type MotionTokenKey = keyof typeof motion;

/**
 * Celebration choreography timeline (plan §4.6.4) — ms offsets from tap.
 *
 *   0     element scales 1.0 → 1.15 (anticipation)
 *   100   element scales back to 1.0 with bounce
 *   150   mascot "yay!" audio plays
 *   200   12–20 confetti particles spawn
 *   300   mascot pose → "cheering" for 800ms
 *   800   total — next round begins automatically
 */
export const celebrationTimeline = {
  anticipationStart: 0,
  anticipationEnd: 100,
  settleEnd: 250,
  audioCueAt: 150,
  confettiAt: 200,
  mascotCheerAt: 300,
  mascotCheerDuration: 800,
  totalDuration: 800,
  confettiCount: { min: 12, max: 20 },
  anticipationScale: 1.15,
} as const;

/**
 * Photosensitivity ceiling. Any animation that flashes (luminance swing)
 * must do so at < 3 Hz. Components that produce flashing effects must
 * import and assert against this.
 */
export const MAX_FLASH_HZ = 3;
