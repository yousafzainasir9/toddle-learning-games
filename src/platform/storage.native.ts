/**
 * Native implementations of SettingsStore and SessionStore.
 *
 * Dynamically imported from `storage.ts`. Do not import directly.
 */
import * as SecureStore from 'expo-secure-store';
import * as SQLite from 'expo-sqlite';

import type { SessionStat, SessionStore, SettingsStore } from './storage';

const SETTINGS_NAMESPACE = 'toodles.settings';

export async function createSecureSettingsStore(): Promise<SettingsStore> {
  return {
    async get(key: string) {
      return SecureStore.getItemAsync(`${SETTINGS_NAMESPACE}.${key}`);
    },
    async set(key: string, value: string) {
      await SecureStore.setItemAsync(`${SETTINGS_NAMESPACE}.${key}`, value);
    },
    async delete(key: string) {
      await SecureStore.deleteItemAsync(`${SETTINGS_NAMESPACE}.${key}`);
    },
  };
}

const DB_NAME = 'toodles.db';
const SCHEMA_VERSION = 1;

export async function createSqliteSessionStore(): Promise<SessionStore> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS session_stats (
      game_id TEXT PRIMARY KEY,
      level INTEGER NOT NULL,
      correct_count INTEGER NOT NULL DEFAULT 0,
      wrong_count INTEGER NOT NULL DEFAULT 0,
      last_played_at INTEGER NOT NULL DEFAULT 0
    );
  `);

  const row = await db.getFirstAsync<{ version: number }>(
    'SELECT version FROM schema_version LIMIT 1',
  );
  if (!row) {
    await db.runAsync(
      'INSERT INTO schema_version (version) VALUES (?)',
      SCHEMA_VERSION,
    );
  }

  return {
    async recordRound(gameId: string, level: number, correct: boolean) {
      const existing = await db.getFirstAsync<{
        correct_count: number;
        wrong_count: number;
      }>(
        'SELECT correct_count, wrong_count FROM session_stats WHERE game_id = ?',
        gameId,
      );
      const correctDelta = correct ? 1 : 0;
      const wrongDelta = correct ? 0 : 1;
      const now = Date.now();
      if (existing) {
        await db.runAsync(
          `UPDATE session_stats
             SET level = ?,
                 correct_count = correct_count + ?,
                 wrong_count = wrong_count + ?,
                 last_played_at = ?
           WHERE game_id = ?`,
          level,
          correctDelta,
          wrongDelta,
          now,
          gameId,
        );
      } else {
        await db.runAsync(
          `INSERT INTO session_stats
             (game_id, level, correct_count, wrong_count, last_played_at)
           VALUES (?, ?, ?, ?, ?)`,
          gameId,
          level,
          correctDelta,
          wrongDelta,
          now,
        );
      }
    },

    async getStat(gameId: string): Promise<SessionStat | null> {
      const row = await db.getFirstAsync<{
        game_id: string;
        level: number;
        correct_count: number;
        wrong_count: number;
        last_played_at: number;
      }>('SELECT * FROM session_stats WHERE game_id = ?', gameId);
      if (!row) return null;
      return {
        gameId: row.game_id,
        level: row.level,
        correctCount: row.correct_count,
        wrongCount: row.wrong_count,
        lastPlayedAt: row.last_played_at,
      };
    },

    async resetGame(gameId: string) {
      await db.runAsync(
        'DELETE FROM session_stats WHERE game_id = ?',
        gameId,
      );
    },

    async resetAll() {
      await db.execAsync('DELETE FROM session_stats');
    },
  };
}
