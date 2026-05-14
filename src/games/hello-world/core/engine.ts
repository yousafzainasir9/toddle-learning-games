/**
 * Hello-world game logic — pure TypeScript.
 *
 * This is a throwaway game whose only job is to exercise the GameModule
 * contract end-to-end (registry, routing, audio, celebration, parent gate
 * exit). It's deliberately tiny so we can keep its tests at 90%+ coverage
 * to lock in the testing pattern.
 *
 * Mechanic: a single big button. Each tap is a "correct" event. Three
 * taps in a row trigger a difficulty bump request (the shell decides what
 * to do with it).
 */
import {
  initialDifficulty,
  onCorrect,
  type DifficultyState,
} from '@core/difficulty-curve';

export interface HelloWorldState {
  readonly taps: number;
  readonly difficulty: DifficultyState;
}

export function createInitialState(): HelloWorldState {
  return {
    taps: 0,
    difficulty: initialDifficulty(),
  };
}

export function tap(state: HelloWorldState): {
  next: HelloWorldState;
  /** +1 if difficulty should bump, 0 otherwise. */
  delta: -1 | 0 | 1;
} {
  const transition = onCorrect(state.difficulty);
  return {
    next: {
      taps: state.taps + 1,
      difficulty: transition.state,
    },
    delta: transition.delta,
  };
}
