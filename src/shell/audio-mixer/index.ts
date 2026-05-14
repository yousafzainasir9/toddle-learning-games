/**
 * Audio mixer service.
 *
 * Thin service that lives in the shell. It owns the global music loop and
 * exposes high-level intents the games use:
 *
 *   - startAmbientMusic(track)
 *   - playPrompt(cue)          // ducks music; plays narration
 *   - playSfx(cue)             // never ducks; very short
 *
 * The actual audio playback lives in `@platform/audio`. This service exists
 * so the rest of the app speaks in product intents ("play prompt") rather
 * than in audio-layer mechanics.
 */
import {
  getAudio,
  installNativeAudio,
  type AudioCue,
} from '@platform/audio';

let booted = false;

export async function bootMixer(): Promise<void> {
  if (booted) return;
  await installNativeAudio();
  booted = true;
}

export async function startAmbientMusic(track: AudioCue): Promise<void> {
  await getAudio().play('music', track);
}

export async function stopAmbientMusic(): Promise<void> {
  await getAudio().stop('music');
}

export async function playPrompt(cue: AudioCue): Promise<void> {
  // Narration layer triggers automatic ducking inside the native adapter.
  await getAudio().play('narration', cue);
}

export async function playSfx(cue: AudioCue): Promise<void> {
  await getAudio().play('sfx', cue);
}

export function setMasterMute(muted: boolean): void {
  getAudio().setMuted(muted);
}

export function isMuted(): boolean {
  return getAudio().isMuted();
}
