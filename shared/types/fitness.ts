/**
 * Shared Fitness Types
 * 
 * Core domain types for the fitness application.
 * Used by both client and admin.
 * 
 * @module shared/types/fitness
 */

// ============================================================================
// Localization
// ============================================================================

export interface LocalizedString {
  ru: string;
  kz: string;
  en: string;
}

export interface LocalizedArray {
  ru: string[];
  kz: string[];
  en: string[];
}

// ============================================================================
// Exercise & Muscle Groups
// ============================================================================

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type MuscleGroupType = 'upper' | 'lower' | 'core' | 'full-body' | 'cardio';

export interface Exercise {
  id: string;
  name: LocalizedString;
  description?: LocalizedString;
  technique?: LocalizedString;
  /** Intensity level 1-10 */
  intensity: number;
  difficulty: Difficulty;
  /** Primary image URL */
  imageUrl?: string;
  /** Video tutorial URL (YouTube, Vimeo, or direct) */
  videoUrl?: string;
  /** Duration in seconds (for timed exercises) */
  duration?: number;
  /** Default reps count */
  defaultReps?: number;
  /** Default sets count */
  defaultSets?: number;
  /** Rest time between sets in seconds */
  restTime?: number;
  /** Calories burned per minute */
  caloriesPerMinute?: number;
  /** Equipment needed */
  equipment?: string[];
  /** Target muscles */
  targetMuscles?: string[];
  /** Tips for proper form */
  tips?: LocalizedArray;
  /** Related exercise IDs */
  relatedExercises?: string[];
  /** Is featured on home page */
  isFeatured?: boolean;
  /** Sort order within category */
  order?: number;
  /** Created timestamp */
  createdAt?: string;
  /** Updated timestamp */
  updatedAt?: string;
}

export interface MuscleGroup {
  id: string;
  name: LocalizedString;
  description?: LocalizedString;
  type: MuscleGroupType;
  imageUrl?: string;
  icon?: string;
  exercises: Exercise[];
  /** Sort order */
  order?: number;
  /** Is visible to users */
  isActive?: boolean;
}

// ============================================================================
// Workout Programs
// ============================================================================

export type WorkoutType = 'strength' | 'cardio' | 'flexibility' | 'hiit' | 'yoga' | 'recovery' | 'custom';

export interface WorkoutExercise {
  exerciseId: string;
  /** Exercise snapshot for offline */
  exercise?: Exercise;
  sets: number;
  reps?: number;
  duration?: number;
  restTime: number;
  /** Notes from trainer */
  notes?: string;
  order: number;
}

export interface WorkoutProgram {
  id: string;
  name: LocalizedString;
  description?: LocalizedString;
  type: WorkoutType;
  difficulty: Difficulty;
  /** Duration in weeks */
  durationWeeks?: number;
  /** Duration in minutes per session */
  estimatedDuration: number;
  /** Calories estimate */
  estimatedCalories?: number;
  imageUrl?: string;
  exercises: WorkoutExercise[];
  /** Target muscle groups */
  targetMuscles: string[];
  /** Created by trainer ID */
  trainerId?: string;
  /** Is template (can be copied) */
  isTemplate: boolean;
  /** Is featured on home */
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// User Progress
// ============================================================================

export interface WorkoutSession {
  id: string;
  oderId: string;
  programId?: string;
  programTitle?: string;
  startTime: string;
  endTime?: string;
  /** Duration in seconds */
  duration: number;
  /** Calories burned */
  calories?: number;
  /** Completed exercises */
  completedExercises: {
    exerciseId: string;
    sets: number;
    reps?: number;
    weight?: number;
    duration?: number;
  }[];
  /** User notes */
  notes?: string;
  /** User rating 1-5 */
  rating?: number;
  /** Mood before workout */
  moodBefore?: 'low' | 'medium' | 'high';
  /** Mood after workout */
  moodAfter?: 'low' | 'medium' | 'high';
}

export interface UserProgress {
  userId: string;
  /** Total workouts completed */
  totalWorkouts: number;
  /** Total time in minutes */
  totalTime: number;
  /** Total calories burned */
  totalCalories: number;
  /** Current streak in days */
  currentStreak: number;
  /** Longest streak ever */
  longestStreak: number;
  /** Last workout date */
  lastWorkoutDate?: string;
  /** Favorite exercises */
  favoriteExercises: string[];
  /** Completed achievements */
  achievements: string[];
  /** Weekly goal (workouts per week) */
  weeklyGoal: number;
  /** This week completed */
  thisWeekCompleted: number;
}

// ============================================================================
// Achievements
// ============================================================================

export type AchievementType = 
  | 'streak' 
  | 'workouts' 
  | 'calories' 
  | 'time' 
  | 'milestone'
  | 'special';

export interface Achievement {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  type: AchievementType;
  icon: string;
  /** Condition to unlock */
  condition: {
    type: 'streak' | 'count' | 'calories' | 'time';
    value: number;
  };
  /** Points/XP reward */
  points: number;
  /** Is rare achievement */
  isRare?: boolean;
}

// ============================================================================
// Challenges
// ============================================================================

export interface Challenge {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  image?: string;
  /** Start date */
  startDate: string;
  /** End date */
  endDate: string;
  /** Goal to complete */
  goal: {
    type: 'workouts' | 'calories' | 'time' | 'exercises';
    value: number;
  };
  /** Reward points */
  reward: number;
  /** Max participants (0 = unlimited) */
  maxParticipants: number;
  /** Current participants count */
  participantsCount: number;
  /** Is active */
  isActive: boolean;
}

// ============================================================================
// Booking & Sessions
// ============================================================================

export interface TrainerProfile {
  id: string;
  userId: string;
  name: string;
  bio?: LocalizedString;
  specializations: string[];
  avatar?: string;
  rating: number;
  reviewsCount: number;
  hourlyRate: number;
  availability: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
}

export interface BookingSlot {
  id: string;
  trainerId: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  bookedBy?: string;
  price: number;
}

// ============================================================================
// Admin Settings
// ============================================================================

export interface GymSettings {
  id: string;
  name: LocalizedString;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  address?: LocalizedString;
  phone?: string;
  email?: string;
  socialLinks?: {
    instagram?: string;
    telegram?: string;
    whatsapp?: string;
  };
  workingHours?: {
    dayOfWeek: number;
    open: string;
    close: string;
    isClosed: boolean;
  }[];
}
