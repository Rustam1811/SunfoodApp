/**
 * Trainer OS - Core Types
 * Based on spec: Operating system for personal trainers
 */

import { Timestamp } from 'firebase/firestore';

// ==========================================
// USER TYPES
// ==========================================

export type UserRole = 'client' | 'coach' | 'admin';

export interface User {
  id: string;
  role: UserRole;
  phone: string;
  name: string;
  email?: string;
  avatar?: string;
  coachId?: string; // For clients only
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  onboardingCompleted: boolean;
  settings: UserSettings;
}

export interface UserSettings {
  showMacros: boolean;
  notifications: boolean;
}

export interface ClientInfo {
  clientId: string;
  name: string;
  phone: string;
  status: 'active' | 'inactive' | 'paused';
  activityStatus: 'green' | 'yellow' | 'red';
  lastWorkoutAt: Timestamp | null;
  lastLoginAt: Timestamp;
  consecutiveSkipDays: number;
  createdAt: Timestamp;
}

// ==========================================
// EXERCISE TYPES
// ==========================================

export type ExerciseCategory = 
  | 'chest' 
  | 'back' 
  | 'shoulders' 
  | 'biceps' 
  | 'triceps' 
  | 'legs' 
  | 'glutes' 
  | 'core' 
  | 'cardio' 
  | 'stretching'
  | 'compound';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  description: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  equipment?: string[];
  muscleGroups: string[];
  createdBy: string; // coachId or 'system'
  isGlobal: boolean;
  createdAt: Timestamp;
}

// ==========================================
// WORKOUT TYPES
// ==========================================

export interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: string; // e.g., '12' or '8-12'
  weight?: string;
  restSeconds: number;
  notes?: string;
  videoUrl?: string; // Coach demo
}

export interface WorkoutTemplate {
  id: string;
  coachId: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type WorkoutStatus = 'scheduled' | 'in_progress' | 'completed' | 'skipped';

export interface WorkoutSet {
  setNumber: number;
  targetReps: string;
  targetWeight?: string;
  actualReps?: number;
  actualWeight?: number;
  completed: boolean;
  completedAt?: Timestamp;
}

export interface SessionExercise {
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutSet[];
  restSeconds: number;
  notes?: string;
  coachVideoUrl?: string;
  clientVideoUrl?: string;
}

export interface WorkoutSession {
  id: string;
  clientId: string;
  coachId: string;
  templateId?: string;
  scheduledDate: Timestamp;
  status: WorkoutStatus;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  exercises: SessionExercise[];
  notes?: string;
  heartRateAvg?: number;
  caloriesBurned?: number;
}

// ==========================================
// NUTRITION TYPES
// ==========================================

export interface Meal {
  name: string;
  description?: string;
  ingredients?: string[];
  macros?: Macros;
}

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DayMeals {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snacks?: Meal[];
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface NutritionPlan {
  id: string;
  clientId: string;
  coachId: string;
  weekStartDate: Timestamp;
  days: Record<DayOfWeek, DayMeals>;
  macros: Macros;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface NutritionCheckmark {
  id: string;
  clientId: string;
  date: Timestamp;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  waterGlasses: number; // 0-12
  snacks: boolean[];
  updatedAt: Timestamp;
}

// ==========================================
// BODY & HEALTH TYPES
// ==========================================

export interface Measurements {
  chest?: number;
  waist?: number;
  hips?: number;
  biceps?: number;
  thighs?: number;
}

export interface BodyMetric {
  id: string;
  clientId: string;
  date: Timestamp;
  weight?: number; // kg
  measurements?: Measurements;
  bodyFat?: number; // %
  photos?: string[];
  notes?: string;
  createdBy: 'client' | 'coach';
}

export interface PersonalRecord {
  id: string;
  clientId: string;
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: Timestamp;
  previousRecord?: {
    weight: number;
    reps: number;
    date: Timestamp;
  };
}

export type HealthNoteType = 'injury' | 'limitation' | 'medical' | 'general';
export type Severity = 'low' | 'medium' | 'high';

export interface HealthNote {
  id: string;
  clientId: string;
  coachId: string;
  type: HealthNoteType;
  title: string;
  content: string;
  severity?: Severity;
  activeUntil?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ==========================================
// VIDEO TYPES
// ==========================================

export type VideoStatus = 'processing' | 'ready' | 'failed';

export interface ClientVideo {
  id: string;
  clientId: string;
  coachId: string;
  sessionId?: string;
  exerciseId?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number; // seconds
  uploadedAt: Timestamp;
  status: VideoStatus;
}

export interface VideoComment {
  id: string;
  videoId: string;
  coachId: string;
  timecode: number; // seconds into video
  comment: string;
  createdAt: Timestamp;
}

// ==========================================
// WATCH METRICS TYPES
// ==========================================

export type MetricSource = 'apple_health' | 'google_fit' | 'manual';

export interface HeartRateData {
  avg: number;
  max: number;
  min: number;
  resting?: number;
}

export interface CaloriesData {
  active: number;
  total: number;
}

export interface WatchMetric {
  id: string;
  clientId: string;
  date: Timestamp;
  source: MetricSource;
  heartRate: HeartRateData;
  calories: CaloriesData;
  steps?: number;
  activeMinutes?: number;
  sleepHours?: number;
}

// ==========================================
// SIGNALS & ALERTS TYPES
// ==========================================

export type SignalType = 'skip_workout' | 'high_heart_rate' | 'low_adherence' | 'no_login';
export type SignalSeverity = 'info' | 'warning' | 'alert';

export interface Signal {
  id: string;
  clientId: string;
  coachId: string;
  type: SignalType;
  severity: SignalSeverity;
  message: string;
  data?: Record<string, unknown>;
  acknowledged: boolean;
  acknowledgedAt?: Timestamp;
  createdAt: Timestamp;
}

export type SummaryStatus = 'green' | 'yellow' | 'red';

export interface WeeklySummary {
  id: string;
  clientId: string;
  coachId: string;
  weekStartDate: Timestamp;
  status: SummaryStatus;
  workoutsPlanned: number;
  workoutsCompleted: number;
  nutritionAdherence: number; // %
  waterAverage: number;
  signals: string[]; // signal IDs
  notes?: string;
  createdAt: Timestamp;
}

// ==========================================
// COACH MESSAGES TYPES
// ==========================================

export type MessageType = 'instruction' | 'feedback' | 'video_comment';

export interface CoachMessage {
  id: string;
  clientId: string;
  coachId: string;
  type: MessageType;
  content: string;
  pinned: boolean;
  videoId?: string;
  timecode?: number;
  read: boolean;
  createdAt: Timestamp;
}

// ==========================================
// UI STATE TYPES
// ==========================================

export type TodayState = 'rest_day' | 'scheduled' | 'in_progress' | 'completed';

export interface TodayScreenData {
  state: TodayState;
  workout?: WorkoutSession;
  coachMessage?: CoachMessage;
  tomorrowPreview?: {
    hasWorkout: boolean;
    workoutName?: string;
  };
}

// ==========================================
// FORM TYPES
// ==========================================

export interface CreateClientForm {
  name: string;
  phone: string;
}

export interface CreateWorkoutForm {
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  scheduledDate: Date;
  clientId: string;
}

export interface CreateExerciseForm {
  name: string;
  category: ExerciseCategory;
  description: string;
  equipment?: string[];
  muscleGroups: string[];
  videoFile?: File;
}
