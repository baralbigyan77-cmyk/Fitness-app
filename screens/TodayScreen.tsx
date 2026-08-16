import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import ProgressBar from '../components/ProgressBar';
import PrimaryButton from '../components/PrimaryButton';
import StatCard from '../components/StatCard';
import { useUser } from '../lib/UserContext';
import { colors, radius } from '../lib/theme';
import { RootStackParamList } from '../lib/navigation';
import { GOAL_LABEL } from '../lib/planGenerator';

export default function TodayScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile, plan, logs, isPremium } = useUser();

  const doneDays = useMemo(() => new Set(logs.map((l) => l.day)), [logs]);
  const nextOpen = useMemo(() => {
    return (
      plan.find((d) => !doneDays.has(d.day) && (!d.isPremium || isPremium)) ||
      plan.find((d) => !doneDays.has(d.day)) ||
      plan[0]
    );
  }, [plan, doneDays, isPremium]);

  const completed = logs.length;
  const calories = logs.reduce((a, l) => a + l.calories, 0);
  const minutes = Math.round(logs.reduce((a, l) => a + l.durationSec, 0) / 60);
  const streak = useMemo(() => {
    const set = new Set(logs.map((l) => l.day));
    let s = 0;
    for (let d = (nextOpen?.day || 1) - 1; d >= 1; d--) {
      if (set.has(d)) s += 1;
      else break;
    }
    return s;
  }, [logs, nextOpen]);

  if (!profile || !nextOpen) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.muted}>Building your plan…</Text>
      </SafeAreaView>
    );
  }

  const locked = nextOpen.isPremium && !isPremium;
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>{greeting},</Text>
            <Text style={styles.name}>{profile.name}</Text>
          </View>
          <Pressable onPress={() => nav.navigate('Profile')} style={styles.avatar}>
            <Text style={styles.avatarT}>{profile.name.slice(0, 1).toUpperCase()}</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Text style={styles.heroK}>DAY {String(nextOpen.day).padStart(2, '0')} / 30</Text>
            {locked ? (
              <View style={styles.lockChip}>
                <Ionicons name="lock-closed" size={12} color={colors.gold} />
                <Text style={styles.lockChipT}>Forge+</Text>
              </View>
            ) : (
              <View style={styles.liveChip}>
                <Text style={styles.liveChipT}>{nextOpen.type === 'rest' ? 'REST' : 'READY'}</Text>
              </View>
            )}
          </View>
          <Text style={styles.heroTitle}>{nextOpen.title}</Text>
          <Text style={styles.heroSub}>
            {nextOpen.focus} · {nextOpen.durationMin || 0} min · {nextOpen.estimatedCalories} kcal
          </Text>
          <View style={styles.diffRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <View key={i} style={[styles.diffDot, i < nextOpen.difficulty && styles.diffOn]} />
            ))}
            <Text style={styles.diffLabel}>intensity</Text>
          </View>
          <PrimaryButton
            label={locked ? 'Unlock days 11–30 · $2.99' : nextOpen.type === 'rest' ? 'Open rest day' : 'Start session'}
            onPress={() => {
              if (locked) nav.navigate('Paywall');
              else nav.navigate('Workout', { day: nextOpen.day });
            }}
            variant={locked ? 'gold' : 'lime'}
            style={{ marginTop: 18 }}
          />
        </View>

        <Text style={styles.section}>This campaign</Text>
        <View style={styles.stats}>
          <StatCard label="Done" value={`${completed}`} hint="of 30 days" accent={colors.lime} />
          <StatCard label="Streak" value={`${streak}`} hint="days in a row" accent={colors.ember} />
          <StatCard label="Burn" value={`${calories}`} hint="kcal logged" />
        </View>
        <View style={{ marginTop: 12 }}>
          <View style={styles.progHead}>
            <Text style={styles.muted}>Plan progress</Text>
            <Text style={styles.muted}>{Math.round((completed / 30) * 100)}%</Text>
          </View>
          <ProgressBar value={completed / 30} />
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Ionicons name="flag" size={18} color={colors.lime} />
            <Text style={styles.infoT}>{GOAL_LABEL[profile.goal]}</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="time" size={18} color={colors.lime} />
            <Text style={styles.infoT}>{minutes} min trained</Text>
          </View>
        </View>

        {!isPremium && (
          <Pressable style={styles.upsell} onPress={() => nav.navigate('Paywall')}>
            <View style={{ flex: 1 }}>
              <Text style={styles.upsellK}>FORGE+</Text>
              <Text style={styles.upsellT}>Unlock the last 20 days for $2.99</Text>
              <Text style={styles.upsellS}>Progressive overload, later weeks, full 30-day finish.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gold} />
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  hello: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  name: { color: colors.text, fontSize: 28, fontWeight: '900' },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarT: { color: '#10140A', fontWeight: '900', fontSize: 18 },
  hero: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.line,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroK: { color: colors.lime, fontWeight: '800', letterSpacing: 1.4, fontSize: 12 },
  heroTitle: { color: colors.text, fontSize: 28, fontWeight: '900', marginTop: 10 },
  heroSub: { color: colors.textMuted, marginTop: 6, fontSize: 14 },
  liveChip: {
    backgroundColor: colors.limeGlow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  liveChipT: { color: colors.lime, fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  lockChip: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: colors.goldDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignItems: 'center',
  },
  lockChipT: { color: colors.gold, fontWeight: '800', fontSize: 11 },
  diffRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  diffDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.surface2 },
  diffOn: { backgroundColor: colors.ember },
  diffLabel: { color: colors.textDim, fontSize: 11, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.6 },
  section: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
    marginTop: 26,
    marginBottom: 12,
  },
  stats: { flexDirection: 'row', gap: 8 },
  progHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  muted: { color: colors.textMuted, fontSize: 13 },
  infoRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  infoT: { color: colors.text, fontWeight: '700', fontSize: 13 },
  upsell: {
    marginTop: 22,
    backgroundColor: '#1A160A',
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(245,200,66,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  upsellK: { color: colors.gold, fontWeight: '900', letterSpacing: 1.6, fontSize: 11 },
  upsellT: { color: colors.text, fontWeight: '800', fontSize: 16, marginTop: 4 },
  upsellS: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
});
