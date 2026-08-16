import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import PrimaryButton from '../components/PrimaryButton';
import { useUser } from '../lib/UserContext';
import { colors, radius } from '../lib/theme';
import { RootStackParamList } from '../lib/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

const PERKS = [
  { icon: 'calendar' as const, title: 'Days 11–30 unlocked', body: 'The last 20 days of your personalized plan, including progressive overload.' },
  { icon: 'trending-up' as const, title: 'Harder later weeks', body: 'Volume and intensity climb after the free intro so the plan actually finishes.' },
  { icon: 'barbell' as const, title: 'Full exercise library', body: 'Later sessions mix strength, metcon, and recovery built for your body stats.' },
  { icon: 'ribbon' as const, title: 'One-time $2.99', body: 'Pay once on this device. No weekly drip. No surprise renewals in this demo.' },
];

export default function PaywallScreen({ navigation }: Props) {
  const { isPremium, unlockPremium, logs } = useUser();
  const [busy, setBusy] = useState(false);
  const doneFree = logs.filter((l) => l.day <= 10).length;

  const buy = async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));
    await unlockPremium();
    setBusy(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Pressable style={styles.close} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={24} color={colors.text} />
      </Pressable>
      <View style={styles.body}>
        <View style={styles.badge}>
          <Ionicons name="diamond" size={18} color={'#1A1404'} />
          <Text style={styles.badgeT}>FORGE+</Text>
        </View>
        <Text style={styles.h1}>Finish the last 20 days</Text>
        <Text style={styles.sub}>
          Your first 10 days are free. Unlock the rest of the 30-day campaign for a single $2.99 payment.
        </Text>

        <View style={styles.price}>
          <Text style={styles.priceN}>$2.99</Text>
          <Text style={styles.priceL}>one-time · days 11–30</Text>
        </View>

        {PERKS.map((p) => (
          <View key={p.title} style={styles.perk}>
            <View style={styles.perkIcon}>
              <Ionicons name={p.icon} size={18} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.perkT}>{p.title}</Text>
              <Text style={styles.perkB}>{p.body}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.hint}>
          {isPremium ? 'You already own Forge+ on this device.' : `${doneFree}/10 free days logged. Keep going or unlock now.`}
        </Text>
      </View>
      <View style={styles.footer}>
        {isPremium ? (
          <PrimaryButton label="You're in · close" onPress={() => navigation.goBack()} />
        ) : (
          <>
            <PrimaryButton label="Unlock Forge+ · $2.99" variant="gold" loading={busy} onPress={buy} />
            <PrimaryButton label="Maybe later" variant="ghost" onPress={() => navigation.goBack()} style={{ marginTop: 10 }} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0C0A05' },
  close: { alignSelf: 'flex-end', padding: 16 },
  body: { flex: 1, paddingHorizontal: 24 },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeT: { color: '#1A1404', fontWeight: '900', letterSpacing: 1.4, fontSize: 12 },
  h1: { color: colors.text, fontSize: 34, fontWeight: '900', lineHeight: 40 },
  sub: { color: colors.textMuted, fontSize: 15, lineHeight: 22, marginTop: 10, marginBottom: 18 },
  price: {
    backgroundColor: colors.goldDim,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(245,200,66,0.35)',
    marginBottom: 18,
  },
  priceN: { color: colors.gold, fontSize: 40, fontWeight: '900' },
  priceL: { color: colors.textMuted, marginTop: 2 },
  perk: { flexDirection: 'row', gap: 12, marginBottom: 14, alignItems: 'flex-start' },
  perkIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.goldDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkT: { color: colors.text, fontWeight: '800', fontSize: 15 },
  perkB: { color: colors.textMuted, fontSize: 13, marginTop: 2, lineHeight: 18 },
  hint: { color: colors.textDim, fontSize: 12, marginTop: 8 },
  footer: { padding: 24 },
});
