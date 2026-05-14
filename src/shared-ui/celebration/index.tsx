/**
 * Celebration — the "yes!" payoff.
 *
 * Choreography (plan §4.6.4, locked):
 *   0–100ms   target element scales 1.00 → 1.15 (anticipation)
 *   100–250ms element scales back to 1.0 with bounce
 *   150ms     mascot "yay!" audio plays
 *   200ms     12–20 confetti particles spawn from the element
 *   300ms     mascot pose → "cheering" for 800ms
 *   800ms     next round begins automatically
 *
 * The component exposes a single imperative `play()` method on a ref;
 * games trigger it when the child does the right thing.
 *
 * Photosensitivity: confetti is multi-colored but never strobes — particles
 * fade in once and fall under gravity. No high-frequency flash (plan §4.6.3).
 */
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { celebrationTimeline, colors } from '@theme';
import { getAudio } from '@platform/audio';

const PARTICLE_PALETTE = [
  colors.sun,
  colors.coral,
  colors.rose,
  colors.mint,
  colors.sky,
  colors.lavender,
  colors.terracotta,
];

export type CelebrationHandle = {
  /** Trigger the celebration at the given on-screen origin. */
  play: (origin?: { x: number; y: number }) => Promise<void>;
};

interface CelebrationProps {
  /** Audio cue id to play at the mascot "yay!" beat. */
  yayAudioId?: string;
}

export const Celebration = forwardRef<CelebrationHandle, CelebrationProps>(
  function Celebration({ yayAudioId = 'celebrate.yay' }, ref) {
    const [activeId, setActiveId] = useState(0);
    const [origin, setOrigin] = useState<{ x: number; y: number }>({
      x: 0,
      y: 0,
    });
    const inFlight = useRef(false);

    useImperativeHandle(ref, () => ({
      async play(at) {
        if (inFlight.current) return;
        inFlight.current = true;
        setOrigin(at ?? { x: 0, y: 0 });
        setActiveId((n) => n + 1);
        // Cue the audio at the designated beat. Audio adapter handles ducking.
        setTimeout(() => {
          void getAudio().play('narration', { id: yayAudioId, source: 0 });
        }, celebrationTimeline.audioCueAt);
        await new Promise<void>((r) =>
          setTimeout(r, celebrationTimeline.totalDuration),
        );
        inFlight.current = false;
      },
    }));

    if (activeId === 0) return null;

    const count =
      celebrationTimeline.confettiCount.min +
      Math.floor(
        Math.random() *
          (celebrationTimeline.confettiCount.max -
            celebrationTimeline.confettiCount.min +
            1),
      );
    const particles = Array.from({ length: count }, (_, i) => i);

    return (
      <View
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {particles.map((i) => (
          <Confetti
            // active id changes per play, forcing re-mount of confetti.
            key={`${activeId}-${i}`}
            originX={origin.x}
            originY={origin.y}
          />
        ))}
      </View>
    );
  },
);

const SPREAD = 220; // px horizontal spread radius
const RISE = 80; // px initial upward thrust
const FALL = 360; // px gravity fall distance

function Confetti({
  originX,
  originY,
}: {
  originX: number;
  originY: number;
}): React.ReactElement {
  const opacity = useSharedValue(0);
  const ty = useSharedValue(0);
  const tx = useSharedValue(0);
  const rotate = useSharedValue(0);

  React.useEffect(() => {
    const xDrift = (Math.random() - 0.5) * SPREAD;
    const lift = -RISE - Math.random() * 30;
    const drop = FALL + Math.random() * 80;
    opacity.value = withSequence(
      withTiming(1, { duration: 120 }),
      withDelay(420, withTiming(0, { duration: 260 })),
    );
    ty.value = withSequence(
      withTiming(lift, { duration: 240, easing: Easing.out(Easing.quad) }),
      withTiming(drop, { duration: 560, easing: Easing.in(Easing.quad) }),
    );
    tx.value = withTiming(xDrift, {
      duration: 800,
      easing: Easing.out(Easing.quad),
    });
    rotate.value = withTiming(Math.random() * 720 - 360, { duration: 800 });
    return () => {
      cancelAnimation(opacity);
      cancelAnimation(ty);
      cancelAnimation(tx);
      cancelAnimation(rotate);
    };
  }, [opacity, ty, tx, rotate]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const color =
    PARTICLE_PALETTE[Math.floor(Math.random() * PARTICLE_PALETTE.length)] ??
    colors.sun;

  return (
    <Animated.View
      style={[
        styles.particle,
        { left: originX, top: originY, backgroundColor: color },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    width: 12,
    height: 16,
    borderRadius: 4,
  },
});
