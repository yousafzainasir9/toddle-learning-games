export type {
  GameModule,
  GameProps,
  SkillTag,
  DifficultyLevel,
} from './game-module';
export { MIN_DIFFICULTY, MAX_DIFFICULTY } from './game-module';
export {
  registerGame,
  getGame,
  listGames,
  freezeRegistry,
  RegistryError,
} from './registry';
export {
  initialDifficulty,
  onCorrect,
  onWrong,
  DEFAULT_DIFFICULTY_CONFIG,
  type DifficultyConfig,
  type DifficultyState,
  type DifficultyTransition,
} from './difficulty-curve';
