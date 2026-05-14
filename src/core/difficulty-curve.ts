/**
 * Difficulty curve — success-rate-based.
 *
 * Per the plan (§7, Letter Safari Iteration 1):
 *   - Bump level after 3 correct in a row.
 *   - Drop level after 2 wrong.
 *
 * We generalize this into a small pure state machine so every game can
 * reuse it. The shell owns the level; the game emits "correct"/"wrong"
 * events.
 *
 * This module is pure TypeScript — no React, no platform deps. It must
 * stay easy to unit-test.
 */
import {
  MAX_DIFFICULTY,
  MIN_DIFFICULTY,
  type DifficultyLevel,
} from './game-module';

export interface DifficultyConfig {
  /** Consecutive correct answers needed to level up. */
  bumpAfterCorrectStreak: number;
  /** Consecutive wrong answers needed to drop a level. */
  dropAfterWrongStreak: number;
  /** Inclusive minimum level. */
  min: DifficultyLevel;
  /** Inclusive maximum level. */
  max: DifficultyLevel;
}

export const DEFAULT_DIFFICULTY_CONFIG: DifficultyConfig = {
  bumpAfterCorrectStreak: 3,
  dropAfterWrongStreak: 2,
  min: MIN_DIFFICULTY,
  max: MAX_DIFFICULTY,
};

export interface DifficultyState {
  readonly level: DifficultyLevel;
  readonly correctStreak: number;
  readonly wrongStreak: number;
}

export interface DifficultyTransition {
  /** Next state after the event. */
  state: DifficultyState;
  /** -1, 0, or +1 — what the shell should report to onDifficultyAdjust. */
  delta: -1 | 0 | 1;
}

/** Initial state at the start of a session. */
export function initialDifficulty(
  level: DifficultyLevel = DEFAULT_DIFFICULTY_CONFIG.min,
  config: DifficultyConfig = DEFAULT_DIFFICULTY_CONFIG,
): DifficultyState {
  return {
    level: clamp(level, config.min, config.max),
    correctStreak: 0,
    wrongStreak: 0,
  };
}

/**
 * Apply a "correct" event.
 */
export function onCorrect(
  state: DifficultyState,
  config: DifficultyConfig = DEFAULT_DIFFICULTY_CONFIG,
): DifficultyTransition {
  const correctStreak = state.correctStreak + 1;
  // We reset wrongStreak on any correct answer — this is the "forgiving"
  // shape: a single wrong tap shouldn't survive a clean correct streak.
  if (
    correctStreak >= config.bumpAfterCorrectStreak &&
    state.level < config.max
  ) {
    return {
      state: { level: state.level + 1, correctStreak: 0, wrongStreak: 0 },
      delta: 1,
    };
  }
  return {
    state: { level: state.level, correctStreak, wrongStreak: 0 },
    delta: 0,
  };
}

/**
 * Apply a "wrong" event.
 *
 * Per the plan (§4.6.4) wrong answers must feel like a non-event, not a
 * punishment — so a single wrong tap NEVER drops difficulty. Only the
 * configured streak does.
 */
export function onWrong(
  state: DifficultyState,
  config: DifficultyConfig = DEFAULT_DIFFICULTY_CONFIG,
): DifficultyTransition {
  const wrongStreak = state.wrongStreak + 1;
  if (
    wrongStreak >= config.dropAfterWrongStreak &&
    state.level > config.min
  ) {
    return {
      state: { level: state.level - 1, correctStreak: 0, wrongStreak: 0 },
      delta: -1,
    };
  }
  return {
    state: { level: state.level, correctStreak: 0, wrongStreak },
    delta: 0,
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
