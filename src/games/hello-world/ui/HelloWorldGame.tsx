/**
 * Hello-world UI. Smoke-test for the GameModule contract.
 */
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Celebration, type CelebrationHandle } from '@shared-ui/celebration';
import { Mascot } from '@shared-ui/mascot';
import { BigButton } from '@shared-ui/big-button';
import { colors, spacing, type } from '@theme';
import type { GameProps } from '@core';

import { createInitialState, tap } from '../core/engine';

export function HelloWorldGame({
  difficulty,
  onDifficultyAdjust,
}: GameProps): React.ReactElement {
  const [state, setState] = useState(createInitialState);
  const celebRef = useRef<CelebrationHandle>(null);

  const handleTap = () => {
    setState((s) => {
      const { next, delta } = tap(s);
      if (delta !== 0) onDifficultyAdjust(delta);
      return next;
    });
    void celebRef.current?.play({ x: 200, y: 320 });
  };

  return (
    <View style={styles.root}>
      <Mascot pose="pointing" size={180} />
      <Text style={styles.prompt}>Tap the button!</Text>
      <Text style={styles.subPrompt}>
        Level {difficulty} · {state.taps} taps
      </Text>
      <BigButton
        label="Tap me"
        tone="primary"
        size={180}
        onPress={handleTap}
        accessibilityLabel="Tap the big button"
      />
      <Celebration ref={celebRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[4],
    backgroundColor: colors.cream,
  },
  prompt: {
    fontFamily: type.prompt.fontFamily,
    fontSize: type.prompt.fontSize,
    fontWeight: type.prompt.fontWeight,
    color: colors.charcoal,
  },
  subPrompt: {
    fontFamily: type.body.fontFamily,
    fontSize: type.body.fontSize,
    color: colors.charcoalSoft,
  },
});
