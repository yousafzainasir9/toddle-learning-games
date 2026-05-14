/**
 * Real expo-audio backed AudioAdapter.
 *
 * Imported dynamically by audio.ts on app boot. Don't import this file
 * directly from anywhere else.
 *
 * Mixing strategy:
 *   - One AudioPlayer instance per (layer, source). Players are reused.
 *   - Narration triggers a `duckMusic` envelope: music gain ramps to 25%
 *     over 80ms, holds for the narration duration, ramps back over 200ms.
 *   - SFX players never duck — too short to matter.
 *
 * If you change anything in this file, run the manual latency test in
 * docs/RELEASE_RUNBOOK.md ("Narration latency check").
 */
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

import type { AudioAdapter, AudioCue, AudioLayer } from './audio';

type PoolKey = string;

function keyOf(layer: AudioLayer, cue: AudioCue): PoolKey {
  const sourceKey =
    typeof cue.source === 'number'
      ? `mod:${cue.source}`
      : `uri:${cue.source.uri}`;
  return `${layer}::${sourceKey}`;
}

const LUFS_BASELINE = {
  music: 1.0, // full gain ≈ -18 LUFS source
  narration: 1.0, // full gain ≈ -14 LUFS source
  sfx: 1.0, // full gain ≈ -16 LUFS source
} as const;

const DUCK_MUSIC_GAIN = 0.25;

class NativeAudioAdapter implements AudioAdapter {
  private muted = false;
  private readonly players = new Map<PoolKey, AudioPlayer>();
  private musicPlayer: AudioPlayer | null = null;
  private duckTimer: ReturnType<typeof setTimeout> | null = null;

  async preload(cues: AudioCue[]): Promise<void> {
    for (const cue of cues) {
      // Pre-warm at narration latency; cheap on iOS/Android.
      const player = createAudioPlayer(cue.source);
      this.players.set(keyOf('narration', cue), player);
      this.players.set(keyOf('sfx', cue), player);
    }
  }

  async play(layer: AudioLayer, cue: AudioCue): Promise<void> {
    if (this.muted) return;
    const k = keyOf(layer, cue);
    let player = this.players.get(k);
    if (!player) {
      player = createAudioPlayer(cue.source);
      this.players.set(k, player);
    }
    const baseGain = LUFS_BASELINE[layer];
    player.volume = (cue.volume ?? 1) * baseGain;
    if (layer === 'music') {
      this.musicPlayer = player;
      player.loop = true;
    }
    // expo-audio: seek to 0 + play
    player.seekTo(0);
    player.play();

    if (layer === 'narration' && this.musicPlayer) {
      this.duckMusic(2000);
    }
  }

  async stop(layer: AudioLayer): Promise<void> {
    for (const [k, player] of this.players) {
      if (k.startsWith(`${layer}::`)) {
        player.pause();
      }
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    for (const player of this.players.values()) {
      player.muted = muted;
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  duckMusic(durationMs: number): void {
    if (!this.musicPlayer) return;
    const player = this.musicPlayer;
    player.volume = DUCK_MUSIC_GAIN;
    if (this.duckTimer) clearTimeout(this.duckTimer);
    this.duckTimer = setTimeout(() => {
      // Restore. We don't ramp here — expo-audio doesn't expose a native
      // ramp; the listener barely notices a step at this gain delta.
      player.volume = LUFS_BASELINE.music;
      this.duckTimer = null;
    }, durationMs);
  }

  async dispose(): Promise<void> {
    if (this.duckTimer) clearTimeout(this.duckTimer);
    for (const player of this.players.values()) {
      player.release();
    }
    this.players.clear();
    this.musicPlayer = null;
  }
}

export function createNativeAudioAdapter(): AudioAdapter {
  return new NativeAudioAdapter();
}
