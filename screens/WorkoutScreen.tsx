import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import ExerciseRow from '../components/ExerciseRow';
import PrimaryButton from '../components/PrimaryButton';
import ProgressBar from '../components/ProgressBar';
import { useUser } from '../lib/UserContext';
import { colors, radius } from '../lib/theme';
import { RootStackParamList } from '../lib/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Workout'>;

export default function WorkoutScreen({ route, navigation }: Props) {
  const { day } = route.params;
  const { plan, logs, isPremium, completeWorkout } = useUser();
  const dayPlan = plan.find((d) => d.day === day);
  const already = logs.find((l) => l.day === day);

  const [phase, setPhase] = useState<'preview' | 'live' | 'done'>(already ? 'done' : 'preview');
  const [exIndex, setExIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [resting, setResting] = useState(false);
  const [restLeft, setRestLeft] = useState(0);
  const [holdLeft, setHoldLeft] = useState(0);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  const locked = !!dayPlan?.isPremium && !isPremium;

  useEffect(() => {
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'live') return;
    tick.current = setInterval(() => {
      setSeconds((s) => s + 1);
      setRestLeft((r) => (r > 0 ? r - 1 : 0));
      setHoldLeft((h) => (h > 0 ? h - 1 : 0));
    }, 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [phase]);

  useEffect(() => {
    if (resting && restLeft === 0 && phase === 'live') {
      setResting(false);
    }
  }, [restLeft, resting, phase]);

  const current = dayPlan?.exercises[exIndex];
  const totalSets = useMemo(
    () => (dayPlan ? dayPlan.exercises.reduce((a, e) => a + e.sets, 0) : 1),
    [dayPlan]
  );
  const doneSets = useMemo(() => {
    if (!dayPlan) return 0;
    const prev = dayPlan.exercises.slice(0, exIndex).reduce((a, e) => a + e.sets, 0);
    return prev + setIndex;
  }, [dayPlan, exIndex, setIndex]);

  if (!dayPlan) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.muted}>Day not found.</Text>
      </SafeAreaView>
    );
  }

  if (locked) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.lockBox}>
          <Ionicons name="lock-closed" size={40} color={colors.gold} />
          <Text style={styles.h1}>Day {day} is Forge+</Text>
          <Text style={styles.muted}>Unlock the last 20 days of your plan for $2.99.</Text>
          <PrimaryButton label="Unlock for $2.99" variant="gold" onPress={() => navigation.navigate('Paywall')} />
          <PrimaryButton label="Back" variant="ghost" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const finish = async () => {
    const cal = Math.max(20, Math.round((dayPlan.estimatedCalories * Math.max(seconds, 60)) / (dayPlan.durationMin * 60 || 1200)));
    await completeWorkout(day, seconds || 60, cal);
    setPhase('done');
  };

  const nextSet = () => {
    if (!current) return;
    if (setIndex + 1 < current.sets) {
      setSetIndex((s) => s + 1);
      setResting(true);
      setRestLeft(current.restSeconds);
      setHoldLeft(0);
      return;
    }
    if (exIndex + 1 < dayPlan.exercises.length) {
      setExIndex((i) => i + 1);
      setSetIndex(0);
      setResting(true);
      setRestLeft(current.restSeconds);
      setHoldLeft(0);
      return;
    }
    finish();
  };

  const startHold = () => {
    if (current?.type === 'time') {
      setHoldLeft(current.seconds || 30);
    }
  };

  const clock = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  if (phase === 'done') {
    const log = logs.find((l) => l.day === day);
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.doneBox}>
          <View style={styles.doneBadge}>
            <Ionicons name="trophy" size={36} color={'#10140A'} />
          </View>
          <Text style={styles.h1}>Day {day} complete</Text>
          <Text style={styles.sub}>{dayPlan.title}</Text>
          <View style={styles.doneStats}>
            <View style={styles.ds}>
              <Text style={styles.dsV}>{Math.round((log?.durationSec || seconds) / 60)}m</Text>
              <Text style={styles.dsL}>time</Text>
            </View>
            <View style={styles.ds}>
              <Text style={styles.dsV}>{log?.calories || dayPlan.estimatedCalories}</Text>
              <Text style={styles.dsL}>kcal</Text>
            </View>
            <View style={styles.ds}>
              <Text style={styles.dsV}>{dayPlan.exercises.length}</Text>
              <Text style={styles.dsL}>moves</Text>
            </View>
          </View>
          <PrimaryButton label="Back to today" onPress={() => navigation.navigate('Main')} />
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'live' && current) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.liveTop}>
          <Pressable onPress={() => {
            const quit = () => navigation.goBack();
            if (Platform.OS === 'web') {
              if (typeof window !== 'undefined' && window.confirm('End session? Progress for this session will be lost unless you finish.')) quit();
              return;
            }
            Alert.alert('End session?', 'Progress for this session will be lost unless you finish.', [
              { text: 'Keep going', style: 'cancel' },
              { text: 'Quit', style: 'destructive', onPress: quit },
            ]);
          }}>
            <Ionicons name="close" size={26} color={colors.text} />
          </Pressable>
          <Text style={styles.clock}>{clock}</Text>
          <Text style={styles.liveCount}>
            {exIndex + 1}/{dayPlan.exercises.length}
          </Text>
        </View>
        <ProgressBar value={doneSets / totalSets} />
        <View style={styles.liveBody}>
          <Text style={styles.kicker}>{resting ? 'REST' : current.muscle.toUpperCase()}</Text>
          <Text style={styles.liveName}>{resting ? 'Breathe' : current.name}</Text>
          <Text style={styles.liveSet}>
            {resting ? `${restLeft}s remaining` : `Set ${setIndex + 1} of ${current.sets}`}
          </Text>
          {!resting && (
            <Text style={styles.liveDose}>
              {current.type === 'time' ? `${current.seconds} seconds` : `${current.reps} reps`}
            </Text>
          )}
          {!resting && holdLeft > 0 && <Text style={styles.hold}>{holdLeft}</Text>}
          <Text style={styles.instr}>{current.instructions}</Text>
        </View>
        <View style={styles.liveFooter}>
          {resting ? (
            <PrimaryButton label="Skip rest" onPress={() => { setResting(false); setRestLeft(0); }} />
          ) : (
            <>
              {current.type === 'time' && holdLeft === 0 && (
                <PrimaryButton label={`Start ${current.seconds}s hold`} onPress={startHold} style={{ marginBottom: 10 }} />
              )}
              <PrimaryButton
                label={exIndex === dayPlan.exercises.length - 1 && setIndex === current.sets - 1 ? 'Finish workout' : 'Set done'}
                onPress={nextSet}
              />
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.nav}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.navT}>Day {dayPlan.day}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.h1}>{dayPlan.title}</Text>
        <Text style={styles.sub}>
          {dayPlan.focus} · Week {dayPlan.week} · {dayPlan.type.replace('_', ' ')}
        </Text>
        <View style={styles.metaRow}>
          <Meta icon="time-outline" text={`${dayPlan.durationMin} min`} />
          <Meta icon="flame-outline" text={`${dayPlan.estimatedCalories} kcal`} />
          <Meta icon="barbell-outline" text={`${dayPlan.exercises.length} moves`} />
        </View>
        {dayPlan.type === 'rest' && dayPlan.exercises.length === 0 && (
          <View style={styles.restCard}>
            <Ionicons name="moon" size={28} color={colors.rest} />
            <Text style={styles.restT}>Full rest day</Text>
            <Text style={styles.muted}>
              Sleep, protein, water. Walk if you feel like it. Mark complete when the day is done.
            </Text>
          </View>
        )}
        {dayPlan.exercises.map((e, i) => (
          <ExerciseRow key={e.exerciseId + i} exercise={e} index={i} />
        ))}
      </ScrollView>
      <View style={styles.footer}>
        {already ? (
          <PrimaryButton label="Already logged · view again" variant="ghost" onPress={() => setPhase('done')} />
        ) : dayPlan.exercises.length === 0 ? (
          <PrimaryButton label="Mark rest complete" onPress={finish} />
        ) : (
          <PrimaryButton label="Start workout" onPress={() => setPhase('live')} />
        )}
      </View>
    </SafeAreaView>
  );
}

function Meta({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={16} color={colors.lime} />
      <Text style={styles.metaT}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 4 },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navT: { color: colors.text, fontWeight: '800' },
  scroll: { padding: 20, paddingBottom: 40 },
  h1: { color: colors.text, fontSize: 30, fontWeight: '900' },
  sub: { color: colors.textMuted, marginTop: 6, marginBottom: 16, textTransform: 'capitalize' },
  metaRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  meta: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  metaT: { color: colors.text, fontWeight: '700', fontSize: 12 },
  footer: { padding: 20, paddingBottom: 24 },
  muted: { color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  restCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 8,
    marginBottom: 16,
  },
  restT: { color: colors.text, fontWeight: '800', fontSize: 18 },
  liveTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  clock: { color: colors.text, fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  liveCount: { color: colors.textMuted, fontWeight: '700' },
  liveBody: { flex: 1, padding: 24, justifyContent: 'center' },
  kicker: { color: colors.lime, fontWeight: '800', letterSpacing: 2, fontSize: 12 },
  liveName: { color: colors.text, fontSize: 40, fontWeight: '900', marginTop: 8 },
  liveSet: { color: colors.textMuted, fontSize: 16, marginTop: 10 },
  liveDose: { color: colors.lime, fontSize: 28, fontWeight: '900', marginTop: 16 },
  hold: { color: colors.ember, fontSize: 72, fontWeight: '900', marginTop: 10 },
  instr: { color: colors.textMuted, fontSize: 15, lineHeight: 22, marginTop: 22 },
  liveFooter: { padding: 20 },
  doneBox: { flex: 1, padding: 28, justifyContent: 'center', gap: 12 },
  doneBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  doneStats: { flexDirection: 'row', gap: 10, marginVertical: 18 },
  ds: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
  },
  dsV: { color: colors.text, fontWeight: '900', fontSize: 22 },
  dsL: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  lockBox: { flex: 1, padding: 28, justifyContent: 'center', gap: 14, alignItems: 'center' },
});
