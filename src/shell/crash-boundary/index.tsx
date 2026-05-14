/**
 * Crash boundary — LOCAL ONLY.
 *
 * No Sentry. No Bugsnag. No analytics. Per plan §3.3, we explicitly
 * excluded Sentry-by-default. If a crash happens, we write to a local
 * file in document storage and show a calm "back to the home tree"
 * screen with Fennie pointing.
 *
 * Child-facing UX: NEVER show an English error to the child. The
 * fallback screen is a mascot + a single big button.
 *
 * Crash log: a developer can pull the log via a hidden settings entry
 * (not implemented in Phase 0). The log is plain JSON; no IDs.
 */
import React, { Component, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@shared-ui/big-button';
import { Mascot } from '@shared-ui/mascot';
import { colors, spacing, type } from '@theme';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  error: Error | null;
}

export class CrashBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }): void {
    // Local-only log. No network.
    // eslint-disable-next-line no-console
    console.error('[toodles crash]', error.message, info.componentStack);
    // TODO Phase 1: persist to FileSystem.documentDirectory + 'crash.log'
    // via expo-file-system. Skipped in Phase 0 to keep dependency surface tight.
  }

  reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container} accessibilityRole="alert">
          <Mascot pose="thinking" size={200} />
          <Text style={styles.message}>Let's go back to the home tree.</Text>
          <BigButton
            label="Home"
            tone="primary"
            onPress={this.reset}
            accessibilityLabel="Return to home"
          />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[5],
    backgroundColor: colors.cream,
    gap: spacing[4],
  },
  message: {
    fontFamily: type.prompt.fontFamily,
    fontSize: type.prompt.fontSize,
    fontWeight: type.prompt.fontWeight,
    lineHeight: type.prompt.lineHeight,
    color: colors.charcoal,
    textAlign: 'center',
  },
});

