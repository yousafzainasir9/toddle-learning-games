/**
 * The GameModule contract — the single interface the shell knows about a
 * mini-game.
 *
 * Architectural rule (plan §2.1): every mini-game is self-contained. To
 * remove a game, delete its folder. To add a game, drop in a folder and
 * register it. The shell never reaches into a game's internals.
 *
 * Game logic in `core/` MUST stay pure TypeScript with no React imports —
 * that's what gives us millisecond unit tests and 90% coverage.
 */
import type { ComponentType } from 'react';
import type { ImageSourcePropType } from 'react-native';

/** Skill areas — used for parent-facing categorization later. */
export type SkillTag =
  | 'letters'
  | 'phonics'
  | 'counting'
  | 'numbers'
  | 'shapes'
  | 'colors'
  | 'patterns'
  | 'spatial'
  | 'categorization'
  | 'fine-motor'
  | 'discovery';

/**
 * Difficulty levels are an integer in [1, MAX_DIFFICULTY].
 * Games can interpret each level however they like, but the curve is shared.
 */
export type DifficultyLevel = number;

export const MIN_DIFFICULTY: DifficultyLevel = 1;
export const MAX_DIFFICULTY: DifficultyLevel = 5;

/**
 * Props passed by the shell to every game component.
 */
export interface GameProps {
  /** Called when the player exits the game via the parent gate. */
  onExit: () => void;
  /** Current difficulty level for this session. */
  difficulty: DifficultyLevel;
  /**
   * Game asks the shell to bump (+1) or drop (-1) difficulty.
   * The shell may clamp or rate-limit; the game must accept whatever the
   * shell does next.
   */
  onDifficultyAdjust: (delta: number) => void;
}

/**
 * The single thing every game folder must export.
 */
export interface GameModule {
  /** Stable kebab-case id. Matches the games/ folder name. */
  id: string;
  /** Human-facing name. Use an i18n key once localization lands. */
  displayName: string;
  /** Small icon for the picker. */
  iconAsset: ImageSourcePropType;
  /** Minimum age in months. Used to soft-suggest games to the right child. */
  minAgeMonths: number;
  /** Maximum age in months. */
  maxAgeMonths: number;
  /** Skills exercised — purely informational. */
  skillTags: SkillTag[];
  /** The React component rendered inside the play/[gameId] route. */
  Component: ComponentType<GameProps>;
  /**
   * Pre-load assets. The shell calls this when the player taps into the
   * game; the picker may also call it eagerly for the previously-played
   * game. Resolves when the game is ready to render at 60fps.
   */
  preload: () => Promise<void>;
  /** Free anything large. Called when the player leaves the game. */
  unload: () => void;
}
