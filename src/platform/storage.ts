/**
 * Storage platform adapter.
 *
 * Two stores:
 *   - SettingsStore (expo-secure-store wrapper) — toggles only. Mute,
 *     haptics-on, parental child-name. No analytics, no IDs.
 *   - SessionStore (expo-sqlite + drizzle) — local-only session stats
 *     used for the difficulty curve. NEVER leaves the device. Verified
 *     in §7.2 compliance.
 *
 * Privacy invariant (plan §2.3):
 *   - We collect no PII.
 *   - There is no network code in the app at all — if I can't make a
 *     request, I can't accidentally leak data.
 */

export interface SettingsStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface SessionStat {
  gameId: string;
  level: number;
  correctCount: number;
  wrongCount: number;
  lastPlayedAt: number; // unix ms
}

export interface SessionStore {
  recordRound(
    gameId: string,
    level: number,
    correct: boolean,
  ): Promise<void>;
  getStat(gameId: string): Promise<SessionStat | null>;
  resetGame(gameId: string): Promise<void>;
  /** TEST-only / dev-only: wipe everything. */
  resetAll(): Promise<void>;
}

// -----------------------------------------------------------------------------
// In-memory defaults (tests, SSR, fallback)
// -----------------------------------------------------------------------------
class MemorySettingsStore implements SettingsStore {
  private readonly map = new Map<string, string>();
  async get(key: string) {
    return this.map.get(key) ?? null;
  }
  async set(key: string, value: string) {
    this.map.set(key, value);
  }
  async delete(key: string) {
    this.map.delete(key);
  }
}

class MemorySessionStore implements SessionStore {
  private readonly stats = new Map<string, SessionStat>();

  async recordRound(gameId: string, level: number, correct: boolean) {
    const existing: SessionStat = this.stats.get(gameId) ?? {
      gameId,
      level,
      correctCount: 0,
      wrongCount: 0,
      lastPlayedAt: 0,
    };
    this.stats.set(gameId, {
      gameId,
      level,
      correctCount: existing.correctCount + (correct ? 1 : 0),
      wrongCount: existing.wrongCount + (correct ? 0 : 1),
      lastPlayedAt: Date.now(),
    });
  }

  async getStat(gameId: string) {
    return this.stats.get(gameId) ?? null;
  }

  async resetGame(gameId: string) {
    this.stats.delete(gameId);
  }

  async resetAll() {
    this.stats.clear();
  }
}

let settings: SettingsStore = new MemorySettingsStore();
let session: SessionStore = new MemorySessionStore();

export function getSettings(): SettingsStore {
  return settings;
}
export function getSessionStore(): SessionStore {
  return session;
}

export function setSettingsAdapter(next: SettingsStore): void {
  settings = next;
}
export function setSessionAdapter(next: SessionStore): void {
  session = next;
}

/**
 * Install real native stores. Call once during app boot.
 *
 * Falls back silently to memory adapters on platforms (web, tests) that
 * don't have SecureStore/SQLite.
 */
export async function installNativeStorage(): Promise<void> {
  try {
    const native = await import('./storage.native');
    setSettingsAdapter(await native.createSecureSettingsStore());
    setSessionAdapter(await native.createSqliteSessionStore());
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[storage] falling back to memory adapters:', e);
  }
}
