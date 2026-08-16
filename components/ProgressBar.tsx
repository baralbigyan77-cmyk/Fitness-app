import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../lib/theme';

export default function ProgressBar({ value, color = colors.lime }: { value: number; color?: string }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    backgroundColor: colors.surface2,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
