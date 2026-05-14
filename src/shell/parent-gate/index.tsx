/**
 * Parent Gate.
 *
 * Plan §6 (Week 3): "drag the slider to the star" — a gesture toddlers
 * cannot do reliably. Used to guard:
 *   - Exiting a game back to the picker
 *   - Opening Settings
 *   - Confirming permanent actions (storage cleanup, etc.)
 *
 * Why a drag-to-target gesture (not a math puzzle): Apple's guidelines
 * recommend either age-checks or "complete a multi-step action that
 * children cannot easily perform." Multi-finger holds and precise drags
 * are both effective. We use a precise drag because the gesture itself
 * is calming — no time pressure, no failure UI.
 *
 * Phase 0 DoD: 5 random taps in 10 seconds must NOT pass the gate
 * (plan §6.3). The drag-distance threshold + the requirement to release
 * over the target enforces this.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Path, Svg } from 'react-native-svg';

import { colors, radius, spacing, type } from '@theme';

const TRACK_WIDTH = 320;
const KNOB_SIZE = 88;
const TARGET_RADIUS = 56;
/** Drag must end within this many px of the star center to count. */
const SNAP_TOLERANCE = 32;

export interface ParentGateProps {
  visible: boolean;
  onPass: () => void;
  onCancel: () => void;
}

export function ParentGate({
  visible,
  onPass,
  onCancel,
}: ParentGateProps): React.ReactElement | null {
  const offset = useSharedValue(0);
  const [hint, setHint] = useState<'idle' | 'try-again'>('idle');

  const maxOffset = TRACK_WIDTH - KNOB_SIZE;
  const targetCenter = maxOffset;

  useEffect(() => {
    if (visible) {
      offset.value = 0;
      setHint('idle');
    }
  }, [visible, offset]);

  const handlePass = useCallback(() => {
    onPass();
  }, [onPass]);

  const handleMiss = useCallback(() => {
    setHint('try-again');
    offset.value = withSpring(0, { damping: 14 });
  }, [offset]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      const next = Math.max(0, Math.min(maxOffset, e.translationX));
      offset.value = next;
    })
    .onEnd(() => {
      const finalX = offset.value + KNOB_SIZE / 2;
      const targetX = targetCenter + KNOB_SIZE / 2;
      if (Math.abs(finalX - targetX) <= SNAP_TOLERANCE) {
        offset.value = withSpring(maxOffset, { damping: 14 });
        runOnJS(handlePass)();
      } else {
        runOnJS(handleMiss)();
      }
    });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  if (!visible) return null;

  return (
    <View style={styles.scrim}>
      <View style={styles.card}>
        <Text style={styles.title}>Parents only</Text>
        <Text style={styles.body}>
          Drag the circle to the star to continue.
        </Text>
        <View style={styles.trackWrap}>
          <View style={styles.track}>
            <View style={styles.target}>
              <Star size={TARGET_RADIUS} />
            </View>
            <GestureDetector gesture={pan}>
              <Animated.View
                style={[styles.knob, knobStyle]}
                accessibilityRole="adjustable"
                accessibilityLabel="Drag the circle to the star"
              />
            </GestureDetector>
          </View>
        </View>
        {hint === 'try-again' ? (
          <Text style={styles.hint}>Try again — drag all the way over.</Text>
        ) : null}
        <Text onPress={onCancel} style={styles.cancel}>
          Back
        </Text>
      </View>
    </View>
  );
}

function Star({ size }: { size: number }): React.ReactElement {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2 L15 9 L22 9.5 L17 14 L18.5 21 L12 17.5 L5.5 21 L7 14 L2 9.5 L9 9 Z"
        fill={colors.sun}
        stroke={colors.charcoal}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(61, 44, 30, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
  },
  card: {
    backgroundColor: colors.cream,
    borderRadius: radius.xl,
    padding: spacing[5],
    minWidth: TRACK_WIDTH + spacing[5] * 2,
    alignItems: 'center',
  },
  title: {
    fontFamily: type.prompt.fontFamily,
    fontSize: type.prompt.fontSize,
    fontWeight: type.prompt.fontWeight,
    lineHeight: type.prompt.lineHeight,
    color: colors.charcoal,
    marginBottom: spacing[2],
  },
  body: {
    fontFamily: type.body.fontFamily,
    fontSize: type.body.fontSize,
    fontWeight: type.body.fontWeight,
    lineHeight: type.body.lineHeight,
    color: colors.charcoalSoft,
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  trackWrap: {
    paddingVertical: spacing[3],
  },
  track: {
    width: TRACK_WIDTH,
    height: KNOB_SIZE,
    backgroundColor: colors.creamDeep,
    borderRadius: KNOB_SIZE / 2,
    justifyContent: 'center',
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: colors.coral,
    shadowColor: colors.charcoal,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  target: {
    position: 'absolute',
    right: spacing[2],
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontFamily: type.caption.fontFamily,
    fontSize: type.caption.fontSize,
    fontWeight: type.caption.fontWeight,
    lineHeight: type.caption.lineHeight,
    color: colors.terracotta,
    marginTop: spacing[2],
  },
  cancel: {
    marginTop: spacing[4],
    fontFamily: type.body.fontFamily,
    fontSize: type.body.fontSize,
    fontWeight: '600',
    color: colors.charcoalSoft,
    textDecorationLine: 'underline',
  },
});
