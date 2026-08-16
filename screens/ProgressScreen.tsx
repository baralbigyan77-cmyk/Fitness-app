import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import ProgressBar from '../components/ProgressBar';
import StatCard from '../components/StatCard';
import { useUser } from '../lib/UserContext';
import { bmiLabel, calcBmi, GOAL_LABEL } from '../lib/planGenerator';
import { colors, radius } from '../lib/theme';

export default function ProgressScreen() {
  const { profile, plan, logs, isPremium } = useUser();
  const done = useMemo(() => new Set(logs.map((l) => l.day)), [logs]);
  const calories = logs.reduce((a, l) => a + l.calories, 0);
  const minutes = Math.round(logs.reduce((a, l) => a + l.durationSec, 0) / 60);
  const workouts = logs.filter((l) => {
    const d = plan.find((p) => p.day === l.day);
    return d && d.type === 'workout';
  }).length;

  const weeks = [1, 2, 3, 4, 5].map((w) => {
    const days = plan.filter((d) => d.week === w);
    const complete = days.filter((d) => done.has(d.day)).length;
    return { w, total: days.length, complete };
  });

  const recent = [...logs].sort((a, b) => b.day - a.day).slice(0, 8);

  if (!profile) return null;
  const bmi = calcBmi(profile);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.sub}>
          {GOAL_LABEL[profile.goal]} · {isPremium ? 'Full 30 unlocked' : 'Free 10-day start'}
        </Text>

        <View style={styles.hero}>
          <Text style={styles.heroN}>{Math.round((logs.length / 30) * 100)}%</Text>
          <Text style={styles.heroL}>of the 30-day campaign</Text>
          <ProgressBar value={logs.length / 30} />
          <Text style={styles.heroHint}>{30 - logs.length} days remaining</Text>
        </View>

        <View style={styles.row}>
          <StatCard label="Sessions" value={String(workouts)} hint="logged workouts" accent={colors.lime} />
          <StatCard label="Minutes" value={String(minutes)} hint="time under load" />
        </View>
        <View style={[styles.row, { marginTop: 8 }]}>
          <StatCard label="Calories" value={String(calories)} hint="estimated burn" accent={colors.ember} />
          <StatCard label="BMI" value={String(bmi)} hint={bmiLabel(bmi)} />
        </View>

        <Text style={styles.section}>Weekly adherence</Text>
        {weeks.map((wk) => (
          <View key={wk.w} style={styles.week}>
            <View style={styles.weekTop}>
              <Text style={styles.weekT}>Week {wk.w}{wk.w >= 2 ? '  ·  Forge+' : ''}</Text>
              <Text style={styles.weekN}>
                {wk.complete}/{wk.total}
              </Text>
            </View>
            <ProgressBar
              value={wk.total ? wk.complete / wk.total : 0}
              color={wk.w >= 2 && !isPremium ? colors.gold : colors.lime}
            />
          </View>
        ))}

        <Text style={styles.section}>Calendar heat</Text>
        <View style={styles.heat}>
          {plan.map((d) => {
            const isDone = done.has(d.day);
            const locked = d.isPremium && !isPremium;
            return (
              <View
                key={d.day}
                style={[
                  styles.heatCell,
                  isDone && styles.heatOn,
                  locked && !isDone && styles.heatLock,
                  d.type !== 'workout' && !isDone && !locked && styles.heatRest,
                ]}
              >
                <Text
                  style={[
                    styles.heatT,
                    isDone && { color: '#10140A' },
                    locked && !isDone && { color: colors.gold },
                  ]}
                >
                  {d.day}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.section}>Recent logs</Text>
        {recent.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="sparkles-outline" size={22} color={colors.textMuted} />
            <Text style={styles.emptyT}>Finish day 1 to start your log.</Text>
          </View>
        ) : (
          recent.map((l) => {
            const d = plan.find((p) => p.day === l.day);
            return (
              <View key={l.day} style={styles.log}>
                <View>
                  <Text style={styles.logT}>Day {l.day} · {d?.title}</Text>
                  <Text style={styles.logS}>
                    {new Date(l.completedAt).toLocaleDateString()} · {Math.round(l.durationSec / 60)} min
                  </Text>
                </View>
                <Text style={styles.logC}>{l.calories} kcal</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 48 },
  title: { color: colors.text, fontSize: 28, fontWeight: '900' },
  sub: { color: colors.textMuted, marginTop: 4, marginBottom: 16 },
  hero: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 14,
  },
  heroN: { color: colors.lime, fontSize: 48, fontWeight: '900' },
  heroL: { color: colors.text, fontWeight: '700', marginBottom: 12 },
  heroHint: { color: colors.textMuted, marginTop: 8, fontSize: 12 },
  row: { flexDirection: 'row', gap: 8 },
  section: { color: colors.text, fontWeight: '800', fontSize: 16, marginTop: 26, marginBottom: 12 },
  week: { marginBottom: 14 },
  weekTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  weekT: { color: colors.text, fontWeight: '700' },
  weekN: { color: colors.textMuted, fontWeight: '700' },
  heat: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  heatCell: {
    width: '13%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
  },
  heatOn: { backgroundColor: colors.lime, borderColor: colors.lime },
  heatLock: { backgroundColor: colors.goldDim, borderColor: 'rgba(245,200,66,0.35)' },
  heatRest: { backgroundColor: '#121826' },
  heatT: { color: colors.textMuted, fontWeight: '800', fontSize: 11 },
  empty: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  emptyT: { color: colors.textMuted },
  log: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  logT: { color: colors.text, fontWeight: '700' },
  logS: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  logC: { color: colors.lime, fontWeight: '800' },
});
