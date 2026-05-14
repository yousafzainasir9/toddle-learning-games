/**
 * Haptics platform adapter — subtle, toggleable.
 *
 * Toodles uses haptics only for confirmation pulses (correct tap, snap into
 * place). Never for error feedback — punishing taps would violate the "no
 * fail state" rule (plan §4.6.4).
 *
 * Like audio, this is wrapped so tests can swap a memory adapter.
 */

export type HapticIntensity = 'light' | 'medium' | 'success';

export interface HapticsAdapter {
  /** Quick confirmation buzz. */
  tap(intensity: HapticIntensity): Promise<void>;
  /** Hard mute — settings toggle. */
  setEnabled(enabled: boolean): void;
  isEnabled(): boolean;
}

class MemoryHapticsAdapter implements HapticsAdapter {
  private enabled = true;
  private readonly log: HapticIntensity[] = [];

  async tap(intensity: HapticIntensity): Promise<void> {
    if (!this.enabled) return;
    this.log.push(intensity);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  __testLog(): readonly HapticIntensity[] {
    return this.log;
  }
}

let adapter: HapticsAdapter = new MemoryHapticsAdapter();

export function getHaptics(): HapticsAdapter {
  return adapter;
}

export function setHapticsAdapter(next: HapticsAdapter): void {
  adapter = next;
}

export async function installNativeHaptics(): Promise<void> {
  if (!(adapter instanceof MemoryHapticsAdapter)) return;
  try {
    const Haptics = await import('expo-haptics');
    const native: HapticsAdapter = {
      ...new MemoryHapticsAdapter(),
      async tap(intensity: HapticIntensity) {
        if (!native.isEnabled()) return;
        if (intensity === 'success') {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
        } else if (intensity === 'medium') {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
    };
    setHapticsAdapter(native);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[haptics] falling back to memory adapter:', e);
  }
}
