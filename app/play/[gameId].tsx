/**
 * Dynamic game loader.
 *
 * Resolves the game from the registry, calls preload(), renders the
 * GameModule's Component. The shell owns difficulty state — games emit
 * delta requests via onDifficultyAdjust.
 *
 * Exit is gated by the parent gate (plan §2.4: "parent gate for exits").
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  getGame,
  initialDifficulty,
  MAX_DIFFICULTY,
  MIN_DIFFICULTY,
  type DifficultyLevel,
} from '@core';
import { ParentGate } from '@shell/parent-gate';
import { colors, safeZone, spacing, type } from '@theme';

export default function PlayRoute(): React.ReactElement {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { gameId } = useLocalSearchParams<{ gameId: string }>();

  const game = useMemo(() => (gameId ? getGame(gameId) : undefined), [gameId]);
  const [ready, setReady] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    initialDifficulty().level,
  );
  const [gateVisible, setGateVisible] = useState(false);

  // Preload assets when the game id resolves.
  useEffect(() => {
    if (!game) return;
    let active = true;
    setReady(false);
    (async () => {
      await game.preload();
      if (active) setReady(true);
    })();
    return () => {
      active = false;
      game.unload();
    };
  }, [game]);

  if (!game) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>That game isn't here.</Text>
      </View>
    );
  }

  const adjust = (delta: number) => {
    setDifficulty((d) =>
      Math.max(MIN_DIFFICULTY, Math.min(MAX_DIFFICULTY, d + delta)),
    );
  };

  const requestExit = () => setGateVisible(true);
  const handleGatePass = () => {
    setGateVisible(false);
    router.replace('/');
  };

  const GameComponent = game.Component;

  return (
    <View style={styles.root}>
      {/* Hidden exit affordance — top-left corner. Long-press to open the
          parent gate. Toddlers can't reliably long-press a small target. */}
      <Pressable
        style={[
          styles.exitHit,
          { top: Math.max(insets.top, safeZone.top) },
        ]}
        onLongPress={requestExit}
        delayLongPress={650}
        accessibilityRole="button"
        accessibilityLabel="Exit (long-press, parent only)"
        onPress={(e: GestureResponderEvent) => e.preventDefault()}
        hitSlop={spacing[2]}
      />

      {ready ? (
        <GameComponent
          onExit={requestExit}
          difficulty={difficulty}
          onDifficultyAdjust={adjust}
        />
      ) : (
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>Loading…</Text>
        </View>
      )}

      <ParentGate
        visible={gateVisible}
        onPass={handleGatePass}
        onCancel={() => setGateVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cream,
  },
  fallbackText: {
    fontFamily: type.body.fontFamily,
    fontSize: type.body.fontSize,
    color: colors.charcoalSoft,
  },
  exitHit: {
    position: 'absolute',
    left: 0,
    width: 56,
    height: 56,
    zIndex: 10,
    // Intentionally invisible — discovery is via long-press only.
  },
});
