export type Goal = 'lose_weight' | 'build_muscle' | 'stay_fit' | 'endurance';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Equipment = 'none' | 'home' | 'gym';
export type Gender = 'male' | 'female' | 'other';
export type DayType = 'workout' | 'rest' | 'active_recovery';
export type ExerciseKind = 'reps' | 'time';

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  goal: Goal;
  level: Level;
  equipment: Equipment;
  daysPerWeek: number;
  createdAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  equipment: Equipment | 'any';
  type: ExerciseKind;
  defaultSets: number;
  defaultReps?: number;
  defaultSeconds?: number;
  instructions: string;
  caloriesPerMin: number;
  focus: string[];
}

export interface PlannedExercise {
  exerciseId: string;
  name: string;
  muscle: string;
  type: ExerciseKind;
  sets: number;
  reps?: number;
  seconds?: number;
  restSeconds: number;
  instructions: string;
}

export interface DayPlan {
  day: number;
  title: string;
  focus: string;
  type: DayType;
  durationMin: number;
  estimatedCalories: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  exercises: PlannedExercise[];
  isPremium: boolean;
  week: number;
}

export interface WorkoutLog {
  day: number;
  completedAt: string;
  durationSec: number;
  calories: number;
}

export interface AppPersisted {
  profile: UserProfile | null;
  plan: DayPlan[];
  logs: WorkoutLog[];
  isPremium: boolean;
}
