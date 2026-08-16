import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../lib/theme';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  compact?: boolean;
}

export default function Chip({ label, selected, onPress, icon, compact }: Props) {
  const content = (
    <View
      style={[
        styles.chip,
        compact && styles.compact,
        selected ? styles.selected : styles.idle,
      ]}
    >
      {icon}
      <Text style={[styles.text, selected && styles.textOn]}>{label}</Text>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  compact: {
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  idle: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
  },
  selected: {
    backgroundColor: colors.lime,
    borderColor: colors.lime,
  },
  text: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  textOn: {
    color: '#10140A',
  },
});
