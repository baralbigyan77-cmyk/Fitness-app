import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PlannedExercise } from '../lib/types';
import { colors, radius } from '../lib/theme';

export default function ExerciseRow({
  exercise,
  index,
  checked,
}: {
  exercise: PlannedExercise;
  index: number;
  checked?: boolean;
}) {
  const dose =
    exercise.type === 'time'
      ? `${exercise.sets} × ${exercise.seconds}s`
      : `${exercise.sets} × ${exercise.reps}`;

  return (
    <View style={[styles.row, checked && styles.checked]}>
      <View style={styles.idx}>
        <Text style={styles.idxText}>{index + 1}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{exercise.name}</Text>
        <Text style={styles.meta}>
          {exercise.muscle} · rest {exercise.restSeconds}s
        </Text>
      </View>
      <Text style={styles.dose}>{dose}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  checked: { opacity: 0.45 },
  idx: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idxText: { color: colors.lime, fontWeight: '800', fontSize: 12 },
  name: { color: colors.text, fontWeight: '700', fontSize: 15 },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  dose: { color: colors.lime, fontWeight: '800', fontSize: 13 },
});
