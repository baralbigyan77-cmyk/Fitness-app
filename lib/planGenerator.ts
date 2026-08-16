import { DayPlan, DayType, Level, PlannedExercise, UserProfile } from './types';
import { EXERCISES, exercisesFor } from './exercises';

const FOCUS_BY_GOAL: Record<UserProfile['goal'], string[]> = {
  lose_weight: ['cardio', 'full', 'legs', 'core', 'push', 'cardio'],
  build_muscle: ['push', 'pull', 'legs', 'upper', 'lower', 'full'],
  stay_fit: ['full', 'push', 'legs', 'core', 'pull', 'cardio'],
  endurance: ['cardio', 'full', 'legs', 'cardio', 'core', 'full'],
};

const TITLES: Record<string, string[]> = {
  push: ['Press Power', 'Upper Drive', 'Push Engine'],
  pull: ['Pull Strength', 'Back Builder', 'Posterior Pull'],
  legs: ['Lower Forge', 'Leg Day', 'Foundation'],
  lower: ['Lower Forge', 'Hip & Ham'],
  upper: ['Upper Armor', 'Torso Work'],
  core: ['Core Armor', 'Midline'],
  cardio: ['Engine Day', 'Sweat Circuit', 'Metcon'],
  full: ['Full Body Forge', 'Total Work', 'Athlete Day'],
  posterior: ['Posterior Chain', 'Hinge Day'],
  mobility: ['Move Well', 'Reset'],
};

function hash(n: number): number {
  return Math.abs((n * 9301 + 49297) % 233280);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[hash(seed) % arr.length];
}

function scheduleDays(total: number, perWeek: number): boolean[] {
  const pattern: boolean[] = [];
  const on = Math.min(6, Math.max(3, perWeek));
  // Distribute training days evenly across a 7-day week
  const week = new Array(7).fill(false) as boolean[];
  if (on === 3) {
    week[0] = week[2] = week[4] = true;
  } else if (on === 4) {
    week[0] = week[1] = week[3] = week[5] = true;
  } else if (on === 5) {
    week[0] = week[1] = week[2] = week[4] = week[5] = true;
  } else {
    week[0] = week[1] = week[2] = week[3] = week[4] = week[5] = true;
  }
  for (let i = 0; i < total; i++) {
    pattern.push(week[i % 7]);
  }
  return pattern;
}

function levelMult(level: Level): { sets: number; reps: number; time: number; rest: number } {
  if (level === 'beginner') return { sets: 0, reps: 0.85, time: 0.85, rest: 50 };
  if (level === 'advanced') return { sets: 1, reps: 1.2, time: 1.25, rest: 35 };
  return { sets: 0, reps: 1, time: 1, rest: 40 };
}

function weekBoost(week: number): number {
  return 1 + (week - 1) * 0.08;
}

function bmiFactor(profile: UserProfile): number {
  const h = profile.heightCm / 100;
  const bmi = profile.weightKg / (h * h);
  if (bmi >= 30) return 0.9;
  if (bmi < 18.5) return 0.92;
  return 1;
}

function caloriesFor(profile: UserProfile, minutes: number, intensity: number): number {
  const met = 5 + intensity * 1.4;
  return Math.round((met * profile.weightKg * minutes) / 60);
}

export function generatePlan(profile: UserProfile): DayPlan[] {
  const training = scheduleDays(30, profile.daysPerWeek);
  const focuses = FOCUS_BY_GOAL[profile.goal];
  const lm = levelMult(profile.level);
  const bf = bmiFactor(profile);
  const plan: DayPlan[] = [];
  let focusIdx = 0;

  for (let i = 0; i < 30; i++) {
    const day = i + 1;
    const week = (Math.floor(i / 7) + 1) as 1 | 2 | 3 | 4 | 5;
    const isPremium = day > 10;
    const isTrain = training[i];

    if (!isTrain) {
      const isActive = day % 7 === 6;
      const type: DayType = isActive ? 'active_recovery' : 'rest';
      plan.push({
        day,
        week,
        title: type === 'rest' ? 'Full Rest' : 'Active Recovery',
        focus: type === 'rest' ? 'Recovery' : 'Mobility',
        type,
        durationMin: type === 'rest' ? 0 : 20,
        estimatedCalories: type === 'rest' ? 0 : Math.round(profile.weightKg * 1.4),
        difficulty: 1,
        exercises:
          type === 'rest'
            ? []
            : [
                {
                  exerciseId: 'inchworm',
                  name: 'Inchworms',
                  muscle: 'Full Body',
                  type: 'reps',
                  sets: 2,
                  reps: 6,
                  restSeconds: 30,
                  instructions: 'Slow walk-outs. Breathe into the stretch.',
                },
                {
                  exerciseId: 'bird-dog',
                  name: 'Bird Dogs',
                  muscle: 'Core',
                  type: 'reps',
                  sets: 2,
                  reps: 8,
                  restSeconds: 20,
                  instructions: 'Slow and controlled. Keep hips level.',
                },
                {
                  exerciseId: 'hip-hinge',
                  name: 'Good Mornings',
                  muscle: 'Hamstrings',
                  type: 'reps',
                  sets: 2,
                  reps: 10,
                  restSeconds: 20,
                  instructions: 'Easy range. Wake the posterior chain.',
                },
                {
                  exerciseId: 'dead-bug',
                  name: 'Dead Bugs',
                  muscle: 'Core',
                  type: 'reps',
                  sets: 2,
                  reps: 8,
                  restSeconds: 20,
                  instructions: 'Low back stays glued down.',
                },
              ],
        isPremium,
      });
      continue;
    }

    const focus = focuses[focusIdx % focuses.length];
    focusIdx += 1;
    const pool = exercisesFor(profile.equipment, focus);
    const fallback = exercisesFor(profile.equipment);
    const source = pool.length >= 5 ? pool : fallback;
    const count = profile.level === 'beginner' ? 5 : profile.level === 'advanced' ? 7 : 6;
    const chosen = [...source].sort((a, b) => hash(day + a.id.length) - hash(day + b.id.length)).slice(0, count);

    // Always include a core finisher if missing
    if (!chosen.some((e) => e.focus.includes('core'))) {
      const core = EXERCISES.find((e) => e.id === 'plank');
      if (core) chosen.push(core);
    }

    const boost = weekBoost(week) * bf;
    const exercises: PlannedExercise[] = chosen.map((e, idx) => {
      const sets = Math.max(2, Math.round((e.defaultSets + lm.sets) * (idx === 0 ? 1 : 1)));
      if (e.type === 'time') {
        return {
          exerciseId: e.id,
          name: e.name,
          muscle: e.muscle,
          type: 'time',
          sets,
          seconds: Math.round((e.defaultSeconds || 30) * lm.time * boost),
          restSeconds: lm.rest,
          instructions: e.instructions,
        };
      }
      return {
        exerciseId: e.id,
        name: e.name,
        muscle: e.muscle,
        type: 'reps',
        sets,
        reps: Math.max(6, Math.round((e.defaultReps || 10) * lm.reps * boost)),
        restSeconds: lm.rest + (e.defaultReps && e.defaultReps <= 6 ? 15 : 0),
        instructions: e.instructions,
      };
    });

    const durationMin = Math.round(
      exercises.reduce((acc, ex) => {
        const work = ex.type === 'time' ? (ex.seconds || 30) * ex.sets : ex.sets * 25;
        return acc + work + ex.sets * ex.restSeconds;
      }, 180) / 60
    );

    const difficulty = Math.min(5, Math.max(1, Math.round(1 + (week - 1) * 0.7 + (profile.level === 'advanced' ? 1.2 : profile.level === 'beginner' ? 0 : 0.5)))) as
      | 1
      | 2
      | 3
      | 4
      | 5;

    plan.push({
      day,
      week,
      title: pick(TITLES[focus] || TITLES.full, day),
      focus: focus.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      type: 'workout',
      durationMin: Math.max(18, Math.min(55, durationMin)),
      estimatedCalories: caloriesFor(profile, Math.max(18, durationMin), difficulty),
      difficulty,
      exercises,
      isPremium,
    });
  }

  return plan;
}

export function calcBmi(profile: UserProfile): number {
  const h = profile.heightCm / 100;
  return Math.round((profile.weightKg / (h * h)) * 10) / 10;
}

export function bmiLabel(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Healthy';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export const GOAL_LABEL: Record<UserProfile['goal'], string> = {
  lose_weight: 'Lose fat',
  build_muscle: 'Build muscle',
  stay_fit: 'Stay fit',
  endurance: 'Endurance',
};

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const EQUIP_LABEL: Record<UserProfile['equipment'], string> = {
  none: 'Bodyweight',
  home: 'Home gym',
  gym: 'Full gym',
};
