import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../lib/theme';

export default function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, accent ? { color: accent } : null]}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    minHeight: 88,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  value: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  hint: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 4,
  },
});
