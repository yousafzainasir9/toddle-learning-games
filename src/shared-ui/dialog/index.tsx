/**
 * Dialog — used ONLY behind the parent gate.
 *
 * Critical rule (plan §4.9): no "are you sure?" dialogs in child-facing UI.
 * This component is for storage-full warnings, parent settings confirmations,
 * compliance-related prompts. Never for the child.
 */
import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { BigButton } from '@shared-ui/big-button';
import { colors, radius, spacing, type } from '@theme';

export interface DialogAction {
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'soft' | 'success';
}

export interface DialogProps {
  visible: boolean;
  title: string;
  message?: string;
  /** 1 or 2 actions. Toddlers never see this. Parents shouldn't see more. */
  actions: DialogAction[];
  onRequestClose: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Dialog({
  visible,
  title,
  message,
  actions,
  onRequestClose,
  style,
}: DialogProps): React.ReactElement {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <View style={styles.scrim}>
        <View style={[styles.card, style]} accessibilityRole="alert">
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            {actions.map((action) => (
              <BigButton
                key={action.label}
                label={action.label}
                onPress={action.onPress}
                tone={action.tone ?? 'soft'}
                size={88}
                style={styles.actionButton}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(61, 44, 30, 0.40)', // charcoal at 40% — see comment below
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[5],
  },
  // We allow the one rgba() above — it's the only translucent scrim in
  // the app, and it's derived from --charcoal. Add a lint exception when
  // wiring up the no-raw-colors rule.
  card: {
    backgroundColor: colors.cream,
    borderRadius: radius.xl,
    padding: spacing[5],
    minWidth: 320,
    maxWidth: 560,
    shadowColor: colors.charcoal,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 8,
  },
  title: {
    fontFamily: type.prompt.fontFamily,
    fontSize: type.prompt.fontSize,
    fontWeight: type.prompt.fontWeight,
    lineHeight: type.prompt.lineHeight,
    color: colors.charcoal,
    marginBottom: spacing[3],
  },
  message: {
    fontFamily: type.body.fontFamily,
    fontSize: type.body.fontSize,
    fontWeight: type.body.fontWeight,
    lineHeight: type.body.lineHeight,
    color: colors.charcoalSoft,
    marginBottom: spacing[4],
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  actionButton: {
    minWidth: 120,
  },
});
