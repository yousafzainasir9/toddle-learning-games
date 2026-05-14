/**
 * Game Picker (home).
 *
 * Layout rules (plan §4.5.4):
 *   - One primary action per screen — but the picker IS itself the
 *     primary surface, so it shows up to 8 game tiles. Each tile is its
 *     own "primary action" though; spacing keeps them well apart.
 *   - Mascot appears on every screen (plan §4.12 checklist).
 *
 * Hidden parent-gate entry: long-press on the mascot opens settings.
 * Toddlers don't long-press reliably; adults can.
 */
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { listGames, type GameModule } from '@core';
import { ParentGate } from '@shell/parent-gate';
import { Mascot } from '@shared-ui/mascot';
import {
  colors,
  gameAccents,
  radius,
  safeZone,
  spacing,
  touchTarget,
  type,
  type GameAccentId,
} from '@theme';

export default function GamePicker(): React.ReactElement {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [gateVisible, setGateVisible] = useState(false);
  const [gateIntent, setGateIntent] = useState<'settings' | null>(null);

  const games = listGames();

  const openSettings = () => {
    setGateIntent('settings');
    setGateVisible(true);
  };

  const handleGatePass = () => {
    setGateVisible(false);
    if (gateIntent === 'settings') router.push('/settings');
    setGateIntent(null);
  };

  return (
    <View
      style={[
        styles.root,
        { paddingTop: Math.max(insets.top, safeZone.top) },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          onLongPress={openSettings}
          accessibilityRole="button"
          accessibilityLabel="Mascot, long-press for parent settings"
          hitSlop={touchTarget.gap}
        >
          <Mascot pose="waving" size={200} />
        </Pressable>
        <Text style={styles.greeting}>Hello!</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {games.length === 0 ? (
          <Text style={styles.empty}>
            No games registered yet. (Phase 0 in progress.)
          </Text>
        ) : (
          games.map((game) => (
            <GameTile
              key={game.id}
              game={game}
              onPress={() => router.push(`/play/${game.id}`)}
            />
          ))
        )}
      </ScrollView>

      <ParentGate
        visible={gateVisible}
        onPass={handleGatePass}
        onCancel={() => {
          setGateVisible(false);
          setGateIntent(null);
        }}
      />
    </View>
  );
}

function GameTile({
  game,
  onPress,
}: {
  game: GameModule;
  onPress: () => void;
}): React.ReactElement {
  const accent =
    gameAccents[game.id as GameAccentId] ?? colors.coral;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Play ${game.displayName}`}
      style={[styles.tile, { backgroundColor: accent }]}
      hitSlop={touchTarget.gap / 2}
    >
      <Text style={styles.tileTitle}>{game.displayName}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  header: {
    alignItems: 'center',
    paddingTop: spacing[3],
    paddingBottom: spacing[3],
  },
  greeting: {
    fontFamily: type.display.fontFamily,
    fontSize: type.display.fontSize,
    fontWeight: type.display.fontWeight,
    color: colors.charcoal,
  },
  grid: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[7],
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing[3],
  },
  tile: {
    width: 220,
    height: 220,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[3],
    shadowColor: colors.charcoal,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 5,
  },
  tileTitle: {
    fontFamily: type.gameTitle.fontFamily,
    fontSize: type.gameTitle.fontSize,
    fontWeight: type.gameTitle.fontWeight,
    color: colors.charcoal,
    textAlign: 'center',
  },
  empty: {
    fontFamily: type.body.fontFamily,
    fontSize: type.body.fontSize,
    color: colors.charcoalSoft,
    padding: spacing[5],
  },
});
