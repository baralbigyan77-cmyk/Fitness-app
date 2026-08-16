import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import Chip from '../components/Chip';
import PrimaryButton from '../components/PrimaryButton';
import ProgressBar from '../components/ProgressBar';
import { colors, radius } from '../lib/theme';
import { Equipment, Gender, Goal, Level, UserProfile } from '../lib/types';
import { useUser } from '../lib/UserContext';

const STEPS = ['You', 'Body', 'Goal', 'Setup'];

export default function OnboardingScreen() {
  const { completeOnboarding } = useUser();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState('28');
  const [gender, setGender] = useState<Gender>('male');
  const [heightCm, setHeightCm] = useState('175');
  const [weightKg, setWeightKg] = useState('75');
  const [goal, setGoal] = useState<Goal>('lose_weight');
  const [level, setLevel] = useState<Level>('beginner');
  const [equipment, setEquipment] = useState<Equipment>('none');
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const canNext = useMemo(() => {
    if (step === 0) return name.trim().length >= 2 && Number(age) >= 14 && Number(age) <= 80;
    if (step === 1) return Number(heightCm) >= 120 && Number(heightCm) <= 230 && Number(weightKg) >= 35 && Number(weightKg) <= 220;
    return true;
  }, [step, name, age, heightCm, weightKg]);

  const bmi = useMemo(() => {
    const h = Number(heightCm) / 100;
    const w = Number(weightKg);
    if (!h || !w) return 0;
    return Math.round((w / (h * h)) * 10) / 10;
  }, [heightCm, weightKg]);

  const finish = async () => {
    setError('');
    setBusy(true);
    const profile: UserProfile = {
      name: name.trim(),
      age: Number(age),
      gender,
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      goal,
      level,
      equipment,
      daysPerWeek,
      createdAt: new Date().toISOString(),
    };
    await completeOnboarding(profile);
    setBusy(false);
  };

  return (
    <LinearGradient colors={['#070908', '#0C1610', '#070908']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.top}>
            <Text style={styles.brand}>FORGE 30</Text>
            <Text style={styles.kicker}>Day {step + 1} of you · step {step + 1}/{STEPS.length}</Text>
            <ProgressBar value={(step + 1) / STEPS.length} />
            <View style={styles.stepRow}>
              {STEPS.map((s, i) => (
                <Text key={s} style={[styles.stepLabel, i === step && styles.stepOn]}>
                  {s}
                </Text>
              ))}
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            {step === 0 && (
              <>
                <Text style={styles.h1}>What should we call you?</Text>
                <Text style={styles.sub}>We'll tailor a 30-day plan around your body and goal.</Text>
                <Field label="First name">
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Alex"
                    placeholderTextColor={colors.textDim}
                    style={styles.input}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </Field>
                <Field label="Age">
                  <TextInput
                    value={age}
                    onChangeText={setAge}
                    keyboardType="number-pad"
                    placeholder="28"
                    placeholderTextColor={colors.textDim}
                    style={styles.input}
                    returnKeyType="done"
                  />
                </Field>
                <Text style={styles.fieldLabel}>Gender</Text>
                <View style={styles.row}>
                  {(
                    [
                      ['male', 'Male'],
                      ['female', 'Female'],
                      ['other', 'Other'],
                    ] as [Gender, string][]
                  ).map(([k, l]) => (
                    <Chip key={k} label={l} selected={gender === k} onPress={() => setGender(k)} />
                  ))}
                </View>
              </>
            )}

            {step === 1 && (
              <>
                <Text style={styles.h1}>Your measurements</Text>
                <Text style={styles.sub}>Used to size volume and estimate calories. Nothing is shared.</Text>
                <View style={styles.split}>
                  <Field label="Height (cm)" style={{ flex: 1 }}>
                    <TextInput
                      value={heightCm}
                      onChangeText={setHeightCm}
                      keyboardType="number-pad"
                      style={styles.input}
                    />
                  </Field>
                  <Field label="Weight (kg)" style={{ flex: 1 }}>
                    <TextInput
                      value={weightKg}
                      onChangeText={setWeightKg}
                      keyboardType="decimal-pad"
                      style={styles.input}
                    />
                  </Field>
                </View>
                <View style={styles.bmiCard}>
                  <View>
                    <Text style={styles.bmiK}>Estimated BMI</Text>
                    <Text style={styles.bmiV}>{bmi || '—'}</Text>
                  </View>
                  <Ionicons name="body" size={36} color={colors.lime} />
                </View>
                <Text style={styles.hint}>You can update these later from Profile. The plan will adapt.</Text>
              </>
            )}

            {step === 2 && (
              <>
                <Text style={styles.h1}>What's the mission?</Text>
                <Text style={styles.sub}>This shapes the focus of each training day.</Text>
                {(
                  [
                    ['lose_weight', 'flame', 'Lose fat', 'Higher density circuits and cardio finishers'],
                    ['build_muscle', 'barbell', 'Build muscle', 'Strength-biased sets with progressive overload'],
                    ['stay_fit', 'heart', 'Stay fit', 'Balanced full-body sessions you can keep'],
                    ['endurance', 'pulse', 'Endurance', 'Engine work, longer sets, less rest'],
                  ] as [Goal, keyof typeof Ionicons.glyphMap, string, string][]
                ).map(([k, icon, title, desc]) => (
                  <Pressable
                    key={k}
                    onPress={() => setGoal(k)}
                    style={[styles.choice, goal === k && styles.choiceOn]}
                  >
                    <View style={styles.choiceIcon}>
                      <Ionicons name={icon} size={20} color={goal === k ? '#10140A' : colors.lime} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.choiceTitle, goal === k && { color: '#10140A' }]}>{title}</Text>
                      <Text style={[styles.choiceDesc, goal === k && { color: '#3A4A20' }]}>{desc}</Text>
                    </View>
                  </Pressable>
                ))}
              </>
            )}

            {step === 3 && (
              <>
                <Text style={styles.h1}>How do you train?</Text>
                <Text style={styles.sub}>We'll only prescribe moves you can actually do.</Text>
                <Text style={styles.fieldLabel}>Experience</Text>
                <View style={styles.row}>
                  {(
                    [
                      ['beginner', 'Beginner'],
                      ['intermediate', 'Intermediate'],
                      ['advanced', 'Advanced'],
                    ] as [Level, string][]
                  ).map(([k, l]) => (
                    <Chip key={k} label={l} selected={level === k} onPress={() => setLevel(k)} />
                  ))}
                </View>
                <Text style={styles.fieldLabel}>Equipment</Text>
                <View style={styles.row}>
                  {(
                    [
                      ['none', 'Bodyweight'],
                      ['home', 'Home gym'],
                      ['gym', 'Full gym'],
                    ] as [Equipment, string][]
                  ).map(([k, l]) => (
                    <Chip key={k} label={l} selected={equipment === k} onPress={() => setEquipment(k)} />
                  ))}
                </View>
                <Text style={styles.fieldLabel}>Days per week</Text>
                <View style={styles.row}>
                  {[3, 4, 5, 6].map((n) => (
                    <Chip key={n} label={`${n} days`} selected={daysPerWeek === n} onPress={() => setDaysPerWeek(n)} />
                  ))}
                </View>
                <View style={styles.note}>
                  <Ionicons name="sparkles" size={18} color={colors.gold} />
                  <Text style={styles.noteText}>
                    Days 1–10 are free. Unlock days 11–30 with Forge+ for $2.99.
                  </Text>
                </View>
              </>
            )}
            {error ? <Text style={styles.err}>{error}</Text> : null}
          </ScrollView>

          <View style={styles.footer}>
            {step > 0 ? (
              <PrimaryButton label="Back" variant="ghost" onPress={() => setStep((s) => s - 1)} style={{ flex: 0.42 }} />
            ) : null}
            <PrimaryButton
              label={step === 3 ? 'Build my 30-day plan' : 'Continue'}
              onPress={() => {
                if (!canNext) {
                  setError('Please fill this step correctly.');
                  return;
                }
                setError('');
                if (step < 3) setStep((s) => s + 1);
                else finish();
              }}
              disabled={!canNext}
              loading={busy}
              style={{ flex: 1 }}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Field({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: object;
}) {
  return (
    <View style={[{ marginBottom: 16 }, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  top: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 8 },
  brand: {
    color: colors.lime,
    fontWeight: '900',
    letterSpacing: 3,
    fontSize: 13,
    marginBottom: 6,
  },
  kicker: { color: colors.textMuted, fontSize: 12, marginBottom: 10 },
  stepRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  stepLabel: { color: colors.textDim, fontSize: 12, fontWeight: '700' },
  stepOn: { color: colors.lime },
  body: { padding: 22, paddingBottom: 40 },
  h1: { color: colors.text, fontSize: 30, fontWeight: '900', lineHeight: 36, marginBottom: 8 },
  sub: { color: colors.textMuted, fontSize: 15, lineHeight: 22, marginBottom: 22 },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 16,
    height: 56,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  split: { flexDirection: 'row', gap: 12 },
  bmiCard: {
    marginTop: 8,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bmiK: { color: colors.textMuted, fontWeight: '700', fontSize: 12 },
  bmiV: { color: colors.lime, fontSize: 36, fontWeight: '900', marginTop: 4 },
  hint: { color: colors.textDim, marginTop: 12, fontSize: 13 },
  choice: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
    marginBottom: 10,
    alignItems: 'center',
  },
  choiceOn: { backgroundColor: colors.lime, borderColor: colors.lime },
  choiceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceTitle: { color: colors.text, fontWeight: '800', fontSize: 16 },
  choiceDesc: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  note: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.goldDim,
    borderRadius: radius.md,
    padding: 14,
    marginTop: 10,
    alignItems: 'center',
  },
  noteText: { color: colors.gold, flex: 1, fontWeight: '600', fontSize: 13, lineHeight: 18 },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 22,
    paddingBottom: 16,
    paddingTop: 8,
  },
  err: { color: colors.danger, marginTop: 8, fontWeight: '700' },
});
