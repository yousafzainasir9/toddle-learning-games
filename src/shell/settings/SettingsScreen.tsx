/**
 * Settings screen.
 *
 * BEHIND THE PARENT GATE. The child never sees this. Layout is calm and
 * dense-by-adult-standards.
 */
import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { setMasterMute } from '@shell/audio-mixer';
import { colors, radius, spacing, type } from '@theme';
import { getHaptics } from '@platform/haptics';

import { useSettings } from './store';

export function SettingsScreen(): React.ReactElement {
  const settings = useSettings();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.heading}>Settings</Text>

      <Row
        label="Sound"
        description="Music, narration, and tap sounds."
        value={!settings.muted}
        onChange={(on) => {
          settings.setMuted(!on);
          setMasterMute(!on);
        }}
      />

      <Row
        label="Haptic feedback"
        description="Subtle vibrations when your child taps correctly."
        value={settings.hapticsEnabled}
        onChange={(on) => {
          settings.setHapticsEnabled(on);
          getHaptics().setEnabled(on);
        }}
      />

      <Row
        label="Reduce motion"
        description="Calmer transitions for sensitive children."
        value={settings.reducedMotion}
        onChange={settings.setReducedMotion}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <Text style={styles.sectionBody}>
          Toodles collects nothing. No accounts, no ads, no analytics. The
          app has no network access. All play data stays on this device.
          {'\n\n'}
          Toodles complies with COPPA and GDPR-K by collecting no data at
          all — there's nothing to disclose because there's nothing to
          gather.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.sectionBody}>
          Toodles is an educational nonprofit project. Source available.
          Designed for ages 1–4.
        </Text>
      </View>
    </ScrollView>
  );
}

function Row({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.creamDeep, true: colors.mint }}
        thumbColor={colors.cream}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: spacing[4], paddingBottom: spacing[7] },
  heading: {
    fontFamily: type.gameTitle.fontFamily,
    fontSize: type.gameTitle.fontSize,
    fontWeight: type.gameTitle.fontWeight,
    lineHeight: type.gameTitle.lineHeight,
    color: colors.charcoal,
    marginBottom: spacing[4],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.creamDeep,
    borderRadius: radius.lg,
    padding: spacing[3],
    marginBottom: spacing[3],
  },
  rowText: { flex: 1, marginRight: spacing[3] },
  rowLabel: {
    fontFamily: type.body.fontFamily,
    fontSize: type.body.fontSize,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: spacing[1] / 2,
  },
  rowDescription: {
    fontFamily: type.caption.fontFamily,
    fontSize: type.caption.fontSize,
    fontWeight: type.caption.fontWeight,
    lineHeight: type.caption.lineHeight,
    color: colors.charcoalSoft,
  },
  section: {
    backgroundColor: colors.creamDeep,
    borderRadius: radius.lg,
    padding: spacing[3],
    marginTop: spacing[3],
  },
  sectionTitle: {
    fontFamily: type.body.fontFamily,
    fontSize: type.body.fontSize,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: spacing[2],
  },
  sectionBody: {
    fontFamily: type.caption.fontFamily,
    fontSize: type.caption.fontSize,
    fontWeight: type.caption.fontWeight,
    lineHeight: type.caption.lineHeight,
    color: colors.charcoalSoft,
  },
});
