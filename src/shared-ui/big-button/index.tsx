/**
 * BigButton — the primary tactile element.
 *
 * Rules (plan §4.5.2):
 *   - Minimum size: 88dp (enforced by `min` style — components cannot
 *     override below this).
 *   - Anticipation + follow-through animation on press (plan §4.6.3):
 *     scale 1.0 → 1.06 → 1.0 with a soft spring.
 *   - Haptic + audio cue on press (plan §4.7.4: every interactive
 *     element has an SFX).
 *   - No precision required: hit slop expands the press area by 24dp.
 */
import React, { useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';

import { colors, radius, spacing, touchTarget, type } from '@theme';
import { getAudio } from '@platform/audio';
import { getHaptics } from '@platform/haptics';

export type BigButtonTone = 'primary' | 'soft' | 'success';

export interface BigButtonProps {
  label?: string;
  /** Optional child instead of a label. */
  children?: React.ReactNode;
  onPress: () => void;
  /** Background tone. */
  tone?: BigButtonTone;
  /** Disable interaction. */
  disabled?: boolean;
  /** Override the minimum size; will still be clamped to >= 88dp. */
  size?: number;
  /** Optional audio cue id to play on press. */
  pressSoundId?: string;
  style?: StyleProp<ViewStyle>;
  /** Visible label for screen readers if `label` isn't set. */
  accessibilityLabel?: string;
}

const TONES: Record<BigButtonTone, { bg: string; fg: string }> = {
  primary: { bg: colors.coral, fg: colors.cream },
  soft: { bg: colors.creamDeep, fg: colors.charcoal },
  success: { bg: colors.mint, fg: colors.charcoal },
};

export function BigButton({
  label,
  children,
  onPress,
  tone = 'primary',
  disabled = false,
  size,
  pressSoundId,
  style,
  accessibilityLabel,
}: BigButtonProps): React.ReactElement {
  const scale = useSharedValue(1);

  const enforcedSize = Math.max(size ?? touchTarget.primary, touchTarget.min);

  const handlePress = useCallback(() => {
    if (disabled) return;
    // Anticipation + follow-through.
    scale.value = withSequence(
      withSpring(1.06, { damping: 12, stiffness: 220 }),
      withSpring(1, { damping: 14, stiffness: 220 }),
    );
    // Audio + haptic. Both go through the platform adapter so muting works.
    void getHaptics().tap('light');
    if (pressSoundId) {
      void getAudio().play('sfx', { id: pressSoundId, source: 0 });
    }
    onPress();
  }, [disabled, onPress, pressSoundId, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const palette = TONES[tone];

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        accessibilityLabel={accessibilityLabel ?? label}
        hitSlop={touchTarget.gap}
        onPress={handlePress}
        disabled={disabled}
        style={[
          styles.base,
          {
            minWidth: enforcedSize,
            minHeight: enforcedSize,
            backgroundColor: palette.bg,
            opacity: disabled ? 0.55 : 1,
          },
          style,
        ]}
      >
        {children ?? (
          <Text style={[styles.label, { color: palette.fg }]}>{label}</Text>
        )}
        <View style={styles.softShadow} pointerEvents="none" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    // Soft shadow — no harsh corners (plan §4.1: soft over sharp).
    shadowColor: colors.charcoal,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  label: {
    fontFamily: type.gameTitle.fontFamily,
    fontSize: type.gameTitle.fontSize,
    fontWeight: type.gameTitle.fontWeight,
    lineHeight: type.gameTitle.lineHeight,
    textAlign: 'center',
  },
  softShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.lg,
  },
});
