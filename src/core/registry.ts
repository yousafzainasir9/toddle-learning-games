/**
 * The game registry.
 *
 * Games register themselves at module-import time. The shell discovers them
 * at build time via this list. Adding a game is one import + one register()
 * call — no menus to update anywhere else.
 *
 * The registry is intentionally a tiny in-memory store, not a global. It
 * exposes a small read API and is otherwise immutable from outside.
 */
import type { GameModule } from './game-module';

const modules: Map<string, GameModule> = new Map();
let frozen = false;

export class RegistryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RegistryError';
  }
}

/**
 * Register a game. Call once per module at import time.
 *
 * Throws if a game with the same id already exists or if the registry
 * has been frozen by `freezeRegistry()`.
 */
export function registerGame(module: GameModule): void {
  if (frozen) {
    throw new RegistryError(
      `Cannot register "${module.id}" — registry is frozen.`,
    );
  }
  if (!module.id || !/^[a-z0-9-]+$/.test(module.id)) {
    throw new RegistryError(
      `Invalid game id "${module.id}". Must be kebab-case [a-z0-9-]+.`,
    );
  }
  if (modules.has(module.id)) {
    throw new RegistryError(`Duplicate game id "${module.id}".`);
  }
  modules.set(module.id, module);
}

/** Returns the registered game with the given id, or undefined. */
export function getGame(id: string): GameModule | undefined {
  return modules.get(id);
}

/** Returns all registered games in registration order. */
export function listGames(): GameModule[] {
  return Array.from(modules.values());
}

/**
 * Freeze the registry. Useful in production: once the shell has booted,
 * nothing should add new games. Tests should NOT call this — they need
 * to register/clear modules per test.
 */
export function freezeRegistry(): void {
  frozen = true;
}

/**
 * TEST-ONLY: clear the registry between test cases.
 * Not exported via the package barrel.
 */
export function __resetRegistryForTests(): void {
  modules.clear();
  frozen = false;
}
