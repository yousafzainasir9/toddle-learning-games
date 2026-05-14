/**
 * Audio platform adapter.
 *
 * Three concurrent layers (plan §4.7.2), mixed live:
 *   1. music   — soft instrumental loop. -18 LUFS. Ducks to -28 LUFS during narration.
 *   2. narration — warm calm adult voice. -14 LUFS. Owns the prompt cadence.
 *   3. sfx     — taps, drops, snaps, confetti pops. -16 LUFS. Short.
 *
 * Implementation notes:
 *   - Uses expo-audio (the new, low-latency API).
 *   - Narration prompts must play within 200ms of request (plan §7
 *     Iteration 1 DoD). We pre-warm players on preload.
 *   - All real-device calls live behind this module so unit tests can
 *     swap in `setAudioAdapter(...)`.
 *   - Master mute lives here, not in components. Toggling mute fades over
 *     200ms to avoid clicks.
 *
 * NOTE: This file intentionally defers `require('expo-audio')` until
 * `installNativeAudio()` is called, so tests/Node imports don't crash.
 */

export type AudioLayer = 'music' | 'narration' | 'sfx';

export type AudioCue = {
  /** Asset module (require('./foo.mp3')) or remote URI. */
  source: number | { uri: string };
  /** Optional unique id; used for de-duping plays. */
  id?: string;
  /** Default 1.0. Per-cue gain in 0..1. */
  volume?: number;
};

export interface AudioAdapter {
  preload(cues: AudioCue[]): Promise<void>;
  play(layer: AudioLayer, cue: AudioCue): Promise<void>;
  stop(layer: AudioLayer): Promise<void>;
  setMuted(muted: boolean): void;
  isMuted(): boolean;
  /** Music ducks down while narration is playing. */
  duckMusic(durationMs: number): void;
  dispose(): Promise<void>;
}

// -----------------------------------------------------------------------------
// In-memory adapter (default for tests, also safe during SSR)
// -----------------------------------------------------------------------------
class MemoryAudioAdapter implements AudioAdapter {
  private muted = false;
  private readonly log: { layer: AudioLayer; id?: string }[] = [];

  async preload(): Promise<void> {
    /* no-op */
  }

  async play(layer: AudioLayer, cue: AudioCue): Promise<void> {
    if (this.muted) return;
    this.log.push({ layer, id: cue.id });
  }

  async stop(_layer: AudioLayer): Promise<void> {
    /* no-op */
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  duckMusic(_durationMs: number): void {
    /* no-op */
  }

  async dispose(): Promise<void> {
    this.log.length = 0;
  }

  /** TEST-ONLY accessor. */
  __testLog(): readonly { layer: AudioLayer; id?: string }[] {
    return this.log;
  }
}

let adapter: AudioAdapter = new MemoryAudioAdapter();

export function getAudio(): AudioAdapter {
  return adapter;
}

export function setAudioAdapter(next: AudioAdapter): void {
  adapter = next;
}

/**
 * Install the real expo-audio-backed adapter. Call once from the root
 * layout's `useEffect` on app boot.
 *
 * Kept dynamic so jest/node imports don't pull native modules.
 */
export async function installNativeAudio(): Promise<void> {
  if (!(adapter instanceof MemoryAudioAdapter)) {
    // Already installed.
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Platform } = require('react-native');
  if (Platform.OS === 'web') return;
  try {
    // Defer import — expo-audio requires a native runtime.
    const native = await import('./audio.native');
    setAudioAdapter(native.createNativeAudioAdapter());
  } catch (e) {
    // If the native module is unavailable (web, tests) we silently keep
    // the memory adapter. The shell logs this to the local crash log.
    // eslint-disable-next-line no-console
    console.warn('[audio] falling back to memory adapter:', e);
  }
}
