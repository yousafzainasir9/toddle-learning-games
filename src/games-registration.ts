/**
 * The single file that imports every game module so it self-registers.
 *
 * To add a game:
 *   1. Drop the folder into src/games/<game-id>/
 *   2. Make sure its index.ts calls `registerGame({...})` at module scope.
 *   3. Add an import line below.
 *
 * The shell never reaches into a game's internals — it only sees them
 * through the registry. So this list is the ONLY place outside the games
 * folder that knows about specific games.
 */

// Phase 0: validate the contract end-to-end with a throwaway demo game.
import '@games/hello-world';

// Iteration 1 (release 1.0) will append:
// import '@games/letter-safari';

// Iteration 2 (release 1.1):
// import '@games/counting-objects';
