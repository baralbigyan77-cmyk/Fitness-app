import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppPersisted, DayPlan, UserProfile, WorkoutLog } from './types';

const KEY = 'forge30.v1';

const empty: AppPersisted = {
  profile: null,
  plan: [],
  logs: [],
  isPremium: false,
};

export async function loadState(): Promise<AppPersisted> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as AppPersisted;
    return {
      profile: parsed.profile ?? null,
      plan: Array.isArray(parsed.plan) ? parsed.plan : [],
      logs: Array.isArray(parsed.logs) ? parsed.logs : [],
      isPremium: !!parsed.isPremium,
    };
  } catch {
    return empty;
  }
}

export async function saveState(state: AppPersisted): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore persistence failures
  }
}

export async function clearState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export type { UserProfile, DayPlan, WorkoutLog };
