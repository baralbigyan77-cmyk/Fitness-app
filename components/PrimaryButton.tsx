import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius } from '../lib/theme';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'lime' | 'ghost' | 'gold' | 'danger';
  style?: ViewStyle;
}

export default function PrimaryButton({ label, onPress, disabled, loading, variant = 'lime', style }: Props) {
  const palette =
    variant === 'ghost'
      ? { bg: 'transparent', border: colors.line, text: colors.text }
      : variant === 'gold'
      ? { bg: colors.gold, border: colors.gold, text: '#1A1404' }
      : variant === 'danger'
      ? { bg: 'rgba(255,90,90,0.12)', border: 'rgba(255,90,90,0.4)', text: colors.danger }
      : { bg: colors.lime, border: colors.lime, text: '#10140A' };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 22,
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
