import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DayPlan } from '../lib/types';
import { colors, radius } from '../lib/theme';

interface Props {
  day: DayPlan;
  done: boolean;
  locked: boolean;
  today: boolean;
  onPress: () => void;
}

export default function DayCard({ day, done, locked, today, onPress }: Props) {
  const typeColor =
    day.type === 'rest' ? colors.rest : day.type === 'active_recovery' ? colors.gold : colors.lime;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        today && styles.today,
        done && styles.done,
        { opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={[styles.badge, { backgroundColor: typeColor + '22' }]}>
        <Text style={[styles.dayNum, { color: typeColor }]}>{String(day.day).padStart(2, '0')}</Text>
      </View>
      <View style={styles.mid}>
        <Text style={styles.title} numberOfLines={1}>
          {day.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {day.focus} · {day.type === 'rest' ? 'Rest day' : `${day.durationMin} min`} · {day.estimatedCalories} kcal
        </Text>
      </View>
      <View style={styles.right}>
        {locked ? (
          <View style={styles.lockWrap}>
            <Ionicons name="lock-closed" size={16} color={colors.gold} />
          </View>
        ) : done ? (
          <Ionicons name="checkmark-circle" size={26} color={colors.lime} />
        ) : day.type === 'rest' ? (
          <Ionicons name="moon" size={22} color={colors.rest} />
        ) : (
          <Ionicons name="play-circle" size={26} color={colors.textMuted} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 12,
  },
  today: {
    borderColor: colors.lime,
    backgroundColor: colors.limeGlow,
  },
  done: {
    borderColor: '#2A3A22',
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNum: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  mid: { flex: 1 },
  title: { color: colors.text, fontSize: 16, fontWeight: '800' },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  right: { width: 32, alignItems: 'center' },
  lockWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.goldDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
