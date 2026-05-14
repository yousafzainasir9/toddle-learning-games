/**
 * Settings store (zustand).
 *
 * Settings are the SHELL'S state, never a game's. Games read these via
 * hooks; they never write to them.
 *
 * Persisted via the platform SettingsStore on every change (we don't
 * batch — there are 4 toggles total, so the writes are cheap).
 */
import { create } from 'zustand';

import { getSettings } from '@platform/storage';

export interface SettingsState {
  /** Master mute. Affects music, narration, and SFX. */
  muted: boolean;
  /** Toggleable haptic feedback. */
  hapticsEnabled: boolean;
  /** Reduce motion (for kids sensitive to animation). Not in plan v1 but trivial to add. */
  reducedMotion: boolean;
  /** Whether the parent has acknowledged COPPA/GDPR-K notice once. */
  parentAcknowledged: boolean;

  /** Actions */
  setMuted: (muted: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  setParentAcknowledged: (ack: boolean) => void;

  /** Load persisted values on app boot. */
  hydrate: () => Promise<void>;
}

const KEYS = {
  muted: 'muted',
  haptics: 'haptics',
  reducedMotion: 'reducedMotion',
  parentAck: 'parentAcknowledged',
} as const;

export const useSettings = create<SettingsState>((set, get) => ({
  muted: false,
  hapticsEnabled: true,
  reducedMotion: false,
  parentAcknowledged: false,

  setMuted: (muted) => {
    set({ muted });
    void getSettings().set(KEYS.muted, muted ? '1' : '0');
  },
  setHapticsEnabled: (enabled) => {
    set({ hapticsEnabled: enabled });
    void getSettings().set(KEYS.haptics, enabled ? '1' : '0');
  },
  setReducedMotion: (reduced) => {
    set({ reducedMotion: reduced });
    void getSettings().set(KEYS.reducedMotion, reduced ? '1' : '0');
  },
  setParentAcknowledged: (ack) => {
    set({ parentAcknowledged: ack });
    void getSettings().set(KEYS.parentAck, ack ? '1' : '0');
  },

  hydrate: async () => {
    const store = getSettings();
    const [muted, haptics, reducedMotion, ack] = await Promise.all([
      store.get(KEYS.muted),
      store.get(KEYS.haptics),
      store.get(KEYS.reducedMotion),
      store.get(KEYS.parentAck),
    ]);
    set({
      muted: muted === '1',
      hapticsEnabled: haptics !== '0', // default on
      reducedMotion: reducedMotion === '1',
      parentAcknowledged: ack === '1',
    });
    // Don't `get()` until after set finishes; React 18 batches just fine here.
    void get; // silence unused warning in non-React code
  },
}));
