/**
 * Root layout — the only place that knows about app-wide concerns.
 *
 * Responsibilities:
 *   - Boot the native platform adapters (audio, storage, haptics).
 *   - Hydrate the settings store from SecureStore.
 *   - Wrap the tree in CrashBoundary + GestureHandlerRootView + SafeArea.
 *   - Register the canonical list of games. This is the ONLY spot that
 *     imports games directly; everything else discovers them via the
 *     registry.
 */
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CrashBoundary } from '@shell/crash-boundary';
import { audioMixer, useSettings } from '@shell';
import {
  installNativeHaptics,
  installNativeStorage,
} from '@platform';
import { colors } from '@theme';

import '../src/games-registration';

void SplashScreen.preventAutoHideAsync().catch(() => {
  /* iOS sometimes throws here harmlessly */
});

export default function RootLayout(): React.ReactElement | null {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Order matters: storage first so the settings store has values to read.
      await installNativeStorage();
      await installNativeHaptics();
      await audioMixer.bootMixer();
      await useSettings.getState().hydrate();
      if (cancelled) return;
      setReady(true);
      await SplashScreen.hideAsync();
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <CrashBoundary>
          <View style={styles.root}>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.cream },
              }}
            />
          </View>
        </CrashBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
});
