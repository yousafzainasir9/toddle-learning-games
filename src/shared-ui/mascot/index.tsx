/**
 * Pip the Panda — the mascot.
 *
 * One companion character across all games. Subtle idle breathing
 * animation; pose swap on demand. Driven by Reanimated so the UI thread
 * owns the animation.
 *
 * Required v1.0 poses: idle, pointing, cheering, thinking, sleeping, waving.
 *
 * The PNGs in assets/mascot are real illustrated art. Swap them by
 * replacing the files at the same paths — the component will pick up
 * the new pixels on next reload.
 *
 * NOTE: The plan §4.4.2 originally specified a fox named Fennie. We
 * substituted a panda named Pip per the project owner's preference.
 * Pandas are a natural fit for the cream + charcoal palette.
 */
import React, { useEffect } from 'react';
import {
  Image,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

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

// require() must be called with a literal string; can't be dynamic.
// Pre-resolve each pose to its asset module.
const POSE_TO_SOURCE: Record<MascotPose, ImageSourcePropType> = {
  idle: require('@assets/mascot/pip-idle.png'),
  pointing: require('@assets/mascot/pip-pointing.png'),
  cheering: require('@assets/mascot/pip-cheering.png'),
  thinking: require('@assets/mascot/pip-thinking.png'),
  sleeping: require('@assets/mascot/pip-sleeping.png'),
  waving: require('@assets/mascot/pip-waving.png'),
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

  return (
    <Animated.View
      style={[{ width: size, height: size }, animatedStyle, style]}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? `Pip the panda, ${pose}`}
    >
      <Image
        source={POSE_TO_SOURCE[pose]}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}
