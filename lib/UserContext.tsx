import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DayPlan, UserProfile, WorkoutLog } from './types';
import { generatePlan } from './planGenerator';
import { clearState, loadState, saveState } from './storage';

interface UserContextValue {
  ready: boolean;
  profile: UserProfile | null;
  plan: DayPlan[];
  logs: WorkoutLog[];
  isPremium: boolean;
  completeOnboarding: (profile: UserProfile) => Promise<void>;
  updateProfile: (profile: UserProfile, regen: boolean) => Promise<void>;
  completeWorkout: (day: number, durationSec: number, calories: number) => Promise<void>;
  unlockPremium: () => Promise<void>;
  resetAll: () => Promise<void>;
}

const Ctx = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<DayPlan[]>([]);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadState().then((s) => {
      if (!mounted) return;
      setProfile(s.profile);
      setPlan(s.plan);
      setLogs(s.logs);
      setIsPremium(s.isPremium);
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(
    async (next: {
      profile?: UserProfile | null;
      plan?: DayPlan[];
      logs?: WorkoutLog[];
      isPremium?: boolean;
    }) => {
      const snapshot = {
        profile: next.profile === undefined ? profile : next.profile,
        plan: next.plan === undefined ? plan : next.plan,
        logs: next.logs === undefined ? logs : next.logs,
        isPremium: next.isPremium === undefined ? isPremium : next.isPremium,
      };
      await saveState(snapshot);
    },
    [profile, plan, logs, isPremium]
  );

  const completeOnboarding = useCallback(
    async (p: UserProfile) => {
      const generated = generatePlan(p);
      setProfile(p);
      setPlan(generated);
      setLogs([]);
      await persist({ profile: p, plan: generated, logs: [] });
    },
    [persist]
  );

  const updateProfile = useCallback(
    async (p: UserProfile, regen: boolean) => {
      setProfile(p);
      if (regen) {
        const generated = generatePlan(p);
        setPlan(generated);
        setLogs([]);
        await persist({ profile: p, plan: generated, logs: [] });
      } else {
        await persist({ profile: p });
      }
    },
    [persist]
  );

  const completeWorkout = useCallback(
    async (day: number, durationSec: number, calories: number) => {
      const entry: WorkoutLog = {
        day,
        completedAt: new Date().toISOString(),
        durationSec,
        calories,
      };
      const next = [...logs.filter((l) => l.day !== day), entry];
      setLogs(next);
      await persist({ logs: next });
    },
    [logs, persist]
  );

  const unlockPremium = useCallback(async () => {
    setIsPremium(true);
    await persist({ isPremium: true });
  }, [persist]);

  const resetAll = useCallback(async () => {
    setProfile(null);
    setPlan([]);
    setLogs([]);
    setIsPremium(false);
    await clearState();
  }, []);

  const value = useMemo(
    () => ({
      ready,
      profile,
      plan,
      logs,
      isPremium,
      completeOnboarding,
      updateProfile,
      completeWorkout,
      unlockPremium,
      resetAll,
    }),
    [ready, profile, plan, logs, isPremium, completeOnboarding, updateProfile, completeWorkout, unlockPremium, resetAll]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUser() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
}
