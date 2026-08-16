import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Chip from '../components/Chip';
import PrimaryButton from '../components/PrimaryButton';
import { useUser } from '../lib/UserContext';
import { bmiLabel, calcBmi, EQUIP_LABEL, GOAL_LABEL, LEVEL_LABEL } from '../lib/planGenerator';
import { colors, radius } from '../lib/theme';
import { Equipment, Goal, Level } from '../lib/types';
import { RootStackParamList } from '../lib/navigation';

export default function ProfileScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile, isPremium, updateProfile, resetAll } = useUser();
  const [editing, setEditing] = useState(false);
  const [heightCm, setHeightCm] = useState(String(profile?.heightCm ?? ''));
  const [weightKg, setWeightKg] = useState(String(profile?.weightKg ?? ''));
  const [goal, setGoal] = useState<Goal>(profile?.goal ?? 'stay_fit');
  const [level, setLevel] = useState<Level>(profile?.level ?? 'beginner');
  const [equipment, setEquipment] = useState<Equipment>(profile?.equipment ?? 'none');
  const [daysPerWeek, setDaysPerWeek] = useState(profile?.daysPerWeek ?? 4);

  if (!profile) return null;
  const bmi = calcBmi(profile);

  const save = async (regen: boolean) => {
    const next = {
      ...profile,
      heightCm: Number(heightCm) || profile.heightCm,
      weightKg: Number(weightKg) || profile.weightKg,
      goal,
      level,
      equipment,
      daysPerWeek,
    };
    await updateProfile(next, regen);
    setEditing(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarT}>{profile.name.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.meta}>
              {profile.age} · {profile.gender} · BMI {bmi} ({bmiLabel(bmi)})
            </Text>
            <Text style={styles.meta}>
              {profile.heightCm} cm · {profile.weightKg} kg
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Row icon="flag" label="Goal" value={GOAL_LABEL[profile.goal]} />
          <Row icon="pulse" label="Level" value={LEVEL_LABEL[profile.level]} />
          <Row icon="barbell" label="Equipment" value={EQUIP_LABEL[profile.equipment]} />
          <Row icon="calendar" label="Frequency" value={`${profile.daysPerWeek} days / week`} last />
        </View>

        <Pressable style={styles.subCard} onPress={() => !isPremium && nav.navigate('Paywall')}>
          <Ionicons name={isPremium ? 'checkmark-circle' : 'diamond'} size={22} color={colors.gold} />
          <View style={{ flex: 1 }}>
            <Text style={styles.subT}>{isPremium ? 'Forge+ active' : 'Upgrade to Forge+'}</Text>
            <Text style={styles.subS}>
              {isPremium ? 'Days 11–30 unlocked' : 'Last 20 days of the plan · $2.99'}
            </Text>
          </View>
          {!isPremium && <Ionicons name="chevron-forward" size={18} color={colors.gold} />}
        </Pressable>

        {!editing ? (
          <PrimaryButton label="Edit body & plan" variant="ghost" onPress={() => setEditing(true)} />
        ) : (
          <View style={styles.edit}>
            <Text style={styles.editH}>Update details</Text>
            <View style={styles.split}>
              <View style={{ flex: 1 }}>
                <Text style={styles.lbl}>Height cm</Text>
                <TextInput value={heightCm} onChangeText={setHeightCm} keyboardType="number-pad" style={styles.input} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.lbl}>Weight kg</Text>
                <TextInput value={weightKg} onChangeText={setWeightKg} keyboardType="decimal-pad" style={styles.input} />
              </View>
            </View>
            <Text style={styles.lbl}>Goal</Text>
            <View style={styles.chips}>
              {(Object.keys(GOAL_LABEL) as Goal[]).map((g) => (
                <Chip key={g} compact label={GOAL_LABEL[g]} selected={goal === g} onPress={() => setGoal(g)} />
              ))}
            </View>
            <Text style={styles.lbl}>Level</Text>
            <View style={styles.chips}>
              {(Object.keys(LEVEL_LABEL) as Level[]).map((g) => (
                <Chip key={g} compact label={LEVEL_LABEL[g]} selected={level === g} onPress={() => setLevel(g)} />
              ))}
            </View>
            <Text style={styles.lbl}>Equipment</Text>
            <View style={styles.chips}>
              {(Object.keys(EQUIP_LABEL) as Equipment[]).map((g) => (
                <Chip key={g} compact label={EQUIP_LABEL[g]} selected={equipment === g} onPress={() => setEquipment(g)} />
              ))}
            </View>
            <Text style={styles.lbl}>Days / week</Text>
            <View style={styles.chips}>
              {[3, 4, 5, 6].map((n) => (
                <Chip key={n} compact label={`${n}`} selected={daysPerWeek === n} onPress={() => setDaysPerWeek(n)} />
              ))}
            </View>
            <PrimaryButton label="Save body only" variant="ghost" onPress={() => save(false)} style={{ marginBottom: 10 }} />
            <PrimaryButton label="Save & rebuild 30-day plan" onPress={() => save(true)} />
            <Text style={styles.warn}>Rebuilding clears workout logs so the new plan starts clean.</Text>
          </View>
        )}

        <PrimaryButton
          label="Reset app"
          variant="danger"
          onPress={() => {
            const message = 'Reset Forge 30? This deletes your profile, plan, and logs on this device.';
            if (Platform.OS === 'web') {
              if (typeof window !== 'undefined' && window.confirm(message)) resetAll();
              return;
            }
            Alert.alert('Reset Forge 30?', 'This deletes your profile, plan, and logs on this device.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Reset', style: 'destructive', onPress: () => resetAll() },
            ]);
          }}
          style={{ marginTop: 16 }}
        />
        <Text style={styles.foot}>Forge 30 · personalized 30-day training</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ icon, label, value, last }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowLine]}>
      <Ionicons name={icon} size={18} color={colors.lime} />
      <Text style={styles.rowL}>{label}</Text>
      <Text style={styles.rowV}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 48 },
  title: { color: colors.text, fontSize: 28, fontWeight: '900', marginBottom: 16 },
  hero: { flexDirection: 'row', gap: 14, alignItems: 'center', marginBottom: 16 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarT: { color: '#10140A', fontWeight: '900', fontSize: 26 },
  name: { color: colors.text, fontSize: 22, fontWeight: '900' },
  meta: { color: colors.textMuted, marginTop: 3, textTransform: 'capitalize' },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 14,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14 },
  rowLine: { borderBottomWidth: 1, borderBottomColor: colors.line },
  rowL: { color: colors.textMuted, flex: 1, fontWeight: '700' },
  rowV: { color: colors.text, fontWeight: '800' },
  subCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#1A160A',
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(245,200,66,0.35)',
    marginBottom: 18,
  },
  subT: { color: colors.gold, fontWeight: '800', fontSize: 16 },
  subS: { color: colors.textMuted, marginTop: 3, fontSize: 12 },
  edit: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: 8,
  },
  editH: { color: colors.text, fontWeight: '800', fontSize: 16, marginBottom: 12 },
  split: { flexDirection: 'row', gap: 10 },
  lbl: { color: colors.textMuted, fontWeight: '800', fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 10, marginBottom: 6 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    color: colors.text,
    height: 48,
    paddingHorizontal: 12,
    fontWeight: '700',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  warn: { color: colors.textDim, fontSize: 12, marginTop: 10 },
  foot: { color: colors.textDim, textAlign: 'center', marginTop: 22, fontSize: 12 },
});
