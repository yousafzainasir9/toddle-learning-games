/**
 * Fennie the Fox — the mascot.
 *
 * One companion character across all games (plan §4.4.2). Subtle idle
 * breathing animation; pose swap on demand. Driven by Reanimated so the
 * UI thread owns the animation.
 *
 * Required v1.0 poses: idle, pointing, cheering, thinking, sleeping, waving.
 *
 * The SVGs in assets/mascot are placeholders — replace with hand-drawn
 * illustration before store submission. See plan §11 Appendix D.
 */
import React, { useEffect } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import IdleSvg from '@assets/mascot/fennie-idle.svg';
import PointingSvg from '@assets/mascot/fennie-pointing.svg';
import CheeringSvg from '@assets/mascot/fennie-cheering.svg';
import ThinkingSvg from '@assets/mascot/fennie-thinking.svg';
import SleepingSvg from '@assets/mascot/fennie-sleeping.svg';
import WavingSvg from '@assets/mascot/fennie-waving.svg';
import { motion } from '@theme';

export type MascotPose =
  | 'idle'
  | 'pointing'
  | 'cheering'
  | 'thinking'
  | 'sleeping'
  | 'waving';

export interface MascotProps {
  pose: MascotPose;
  size?: number;
  /** Disable the idle breath (e.g., while paused). Default true. */
  breathing?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const POSE_TO_SVG: Record<
  MascotPose,
  React.ComponentType<{ width: number; height: number }>
> = {
  idle: IdleSvg,
  pointing: PointingSvg,
  cheering: CheeringSvg,
  thinking: ThinkingSvg,
  sleeping: SleepingSvg,
  waving: WavingSvg,
};

export function Mascot({
  pose,
  size = 240,
  breathing = true,
  style,
  accessibilityLabel,
}: MascotProps): React.ReactElement {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!breathing) {
      cancelAnimation(scale);
      scale.value = 1;
      return undefined;
    }
    // Breath token from theme: 2400ms sin-wave. We mimic with a timing
    // animation that grows then shrinks (a smooth, never-jittery loop).
    const breath = motion.breath;
    if (breath.kind !== 'timing') return undefined;
    const half = breath.duration / 2;
    scale.value = withRepeat(
      withTiming(1.04, {
        duration: half,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
    return () => {
      cancelAnimation(scale);
    };
  }, [breathing, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const Svg = POSE_TO_SVG[pose];

  return (
    <Animated.View
      style={[{ width: size, height: size }, animatedStyle, style]}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? `Fennie the fox, ${pose}`}
    >
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} />
      </View>
    </Animated.View>
  );
}
