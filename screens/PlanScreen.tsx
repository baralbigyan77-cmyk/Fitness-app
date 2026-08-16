import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DayCard from '../components/DayCard';
import Chip from '../components/Chip';
import { useUser } from '../lib/UserContext';
import { colors } from '../lib/theme';
import { RootStackParamList } from '../lib/navigation';
import { DayPlan } from '../lib/types';

const WEEKS = [0, 1, 2, 3, 4, 5];

export default function PlanScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { plan, logs, isPremium } = useUser();
  const [week, setWeek] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const done = useMemo(() => new Set(logs.map((l) => l.day)), [logs]);
  const currentDay = useMemo(() => {
    const next = plan.find((d) => !done.has(d.day));
    return next?.day ?? 30;
  }, [plan, done]);

  const data = useMemo(() => {
    if (week === 0) return plan;
    return plan.filter((d) => d.week === week);
  }, [plan, week]);

  const onOpen = (d: DayPlan) => {
    if (d.isPremium && !isPremium) {
      nav.navigate('Paywall');
      return;
    }
    nav.navigate('Workout', { day: d.day });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.head}>
        <Text style={styles.title}>30-day plan</Text>
        <Text style={styles.sub}>
          {done.size} complete · {isPremium ? 'Forge+ unlocked' : 'Days 11–30 locked'}
        </Text>
      </View>
      <View style={styles.filters}>
        <Chip label="All" compact selected={week === 0} onPress={() => setWeek(0)} />
        {WEEKS.slice(1).map((w) => (
          <Chip key={w} label={`W${w}`} compact selected={week === w} onPress={() => setWeek(w)} />
        ))}
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.day)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <DayCard
            day={item}
            done={done.has(item.day)}
            locked={item.isPremium && !isPremium}
            today={item.day === currentDay}
            onPress={() => onOpen(item)}
          />
        )}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => setRefreshing(false), 500);
        }}
        ListHeaderComponent={
          !isPremium ? (
            <Pressable style={styles.banner} onPress={() => nav.navigate('Paywall')}>
              <Text style={styles.bannerT}>Forge+ · $2.99 unlocks days 11–30</Text>
            </Pressable>
          ) : null
        }
        ListEmptyComponent={<Text style={styles.empty}>No days in this week.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  head: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 6 },
  title: { color: colors.text, fontSize: 28, fontWeight: '900' },
  sub: { color: colors.textMuted, marginTop: 4 },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 10 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  banner: {
    backgroundColor: colors.goldDim,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(245,200,66,0.3)',
  },
  bannerT: { color: colors.gold, fontWeight: '800', textAlign: 'center' },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
});
