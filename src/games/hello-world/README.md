# Hello-World (Phase 0 smoke test)

A throwaway game whose only job is to validate the `GameModule` contract end-to-end. Delete it once Letter Safari (Iteration 1) ships.

## Mechanic

A single big button. Each tap is a "correct" event. After 3 consecutive taps the engine asks the shell to bump difficulty.

## Why it exists

- Proves `registerGame` works at module-import time
- Proves the dynamic loader (`app/play/[gameId].tsx`) finds and renders games
- Proves `Celebration`, `Mascot`, and `BigButton` integrate
- Proves the parent-gate exit path works
- Locks in the directory layout every real game must follow (`core/`, `ui/`, `index.ts`)
