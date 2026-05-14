/**
 * Hello-world GameModule registration.
 *
 * Imported once from src/games-registration.ts. Side effect: registers
 * the module with the registry. No other code should reach into this
 * folder.
 */
import { registerGame, type GameModule } from '@core';

import { HelloWorldGame } from './ui/HelloWorldGame';

const module: GameModule = {
  id: 'hello-world',
  displayName: 'Hello!',
  // Phase 0 placeholder — uses the mascot icon stub. Replace with a real
  // game icon for production.
  iconAsset: { uri: 'data:,' },
  minAgeMonths: 12,
  maxAgeMonths: 48,
  skillTags: ['discovery'],
  Component: HelloWorldGame,
  async preload() {
    // Nothing to preload for the smoke test.
  },
  unload() {
    // Nothing to free.
  },
};

registerGame(module);

export default module;
