/**
 * Workout Service - Training Sessions for Trainer OS
 * 
 * Manages scheduled workouts, workout sessions, and exercise tracking.
 * Used by ClientToday and WorkoutExecution pages.
 * 
 * @module services/workoutService
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { LocalizedString } from '../../shared/types/fitness';

// ============================================================================
// Types
// ============================================================================

export type WorkoutStatus = 'scheduled' | 'in_progress' | 'completed' | 'missed';

export interface ScheduledExercise {
  id: string;
  exerciseId: string;
  name: LocalizedString;
  sets: number;
  reps: number;
  duration?: number; // seconds
  restTime: number; // seconds between sets
  restBetweenSets?: number; // rest time before next exercise
  weight?: number; // kg
  notes?: string;
  videoUrl?: string;
  order: number;
}

export interface SetResult {
  setNumber: number;
  completed: boolean;
  reps?: number;
  weight?: number;
  duration?: number;
  notes?: string;
}

export interface ExerciseResult {
  exerciseId: string;
  sets: SetResult[];
  completed: boolean;
  videoUrl?: string; // Client-recorded video
  notes?: string;
}

export interface ScheduledWorkout {
  id: string;
  clientId: string;
  trainerId: string;
  title: string;
  description?: string;
  scheduledDate: string; // ISO date string
  scheduledTime?: string; // HH:mm
  status: WorkoutStatus;
  exercises: ScheduledExercise[];
  estimatedDuration?: number; // minutes
  
  // Execution data
  startedAt?: string;
  completedAt?: string;
  duration?: number; // seconds
  results?: ExerciseResult[];
  
  // Session progress (for resume after background)
  currentExerciseIndex?: number;
  currentSetIndex?: number;
  
  // Feedback
  clientNotes?: string;
  clientRating?: number; // 1-5
  trainerNotes?: string;
  
  createdAt: string;
  updatedAt: string;
}

// Alias types for WorkoutExecution compatibility
export type Workout = ScheduledWorkout;
export type ExerciseInWorkout = ScheduledExercise;

export interface TodayWorkoutState {
  type: 'rest_day' | 'scheduled' | 'in_progress' | 'completed';
  workout: ScheduledWorkout | null;
  message: string;
}

// ============================================================================
// Constants
// ============================================================================

// Coach saves plans to users/{clientId}/workoutPlans
// We read from there and convert to ScheduledWorkout format

// ============================================================================
// Helpers - Convert coach plan to scheduled workout format
// ============================================================================

interface CoachWorkoutPlan {
  id: string;
  date: string;
  title: string;
  exercises: Array<{
    id: string;
    name: string;
    sets: number;
    reps: number;
    weight?: number;
    restSeconds?: number;
    notes?: string;
    videoUrl?: string;
  }>;
  status?: 'planned' | 'completed' | 'skipped' | 'in_progress';
  startedAt?: string;
  completedAt?: string;
  results?: ExerciseResult[];
  currentExerciseIndex?: number;
  currentSetIndex?: number;
}

function convertCoachPlanToWorkout(plan: CoachWorkoutPlan, clientId: string): ScheduledWorkout {
  return {
    id: plan.id,
    clientId,
    trainerId: '', // Will be filled from user data if needed
    title: plan.title,
    scheduledDate: plan.date,
    status: plan.status === 'completed' ? 'completed' 
          : plan.status === 'in_progress' ? 'in_progress'
          : plan.status === 'skipped' ? 'missed' 
          : 'scheduled',
    exercises: plan.exercises.map((ex, index) => ({
      id: ex.id,
      exerciseId: ex.id,
      name: { ru: ex.name, en: ex.name, kz: ex.name },
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      restTime: ex.restSeconds || 60,
      notes: ex.notes,
      videoUrl: ex.videoUrl,
      order: index,
    })),
    startedAt: plan.startedAt,
    completedAt: plan.completedAt,
    results: plan.results,
    currentExerciseIndex: plan.currentExerciseIndex,
    currentSetIndex: plan.currentSetIndex,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// Today's Workout
// ============================================================================

/**
 * Get today's workout for a client from users/{clientId}/workoutPlans
 */
export async function getTodayWorkout(clientId: string): Promise<TodayWorkoutState> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  try {
    // Read from coach-created plans
    const plansRef = collection(db, 'users', clientId, 'workoutPlans');
    const plansQuery = query(
      plansRef,
      where('date', '==', todayStr),
      limit(1)
    );
    
    const snapshot = await getDocs(plansQuery);
    
    if (snapshot.empty) {
      return {
        type: 'rest_day',
        workout: null,
        message: 'День отдыха',
      };
    }
    
    const planDoc = snapshot.docs[0];
    const plan = { id: planDoc.id, ...planDoc.data() } as CoachWorkoutPlan;
    const workout = convertCoachPlanToWorkout(plan, clientId);
    
    switch (workout.status) {
      case 'completed':
        return {
          type: 'completed',
          workout,
          message: 'Тренировка завершена',
        };
      case 'in_progress':
        return {
          type: 'in_progress',
          workout,
          message: 'Тренировка в процессе',
        };
      default:
        return {
          type: 'scheduled',
          workout,
          message: 'Тренировка запланирована',
        };
    }
  } catch (error) {
    return {
      type: 'rest_day',
      workout: null,
      message: 'День отдыха',
    };
  }
}

/**
 * Subscribe to today's workout changes
 */
export function subscribeTodayWorkout(
  clientId: string,
  callback: (state: TodayWorkoutState) => void
): () => void {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  // Read from coach-created plans
  const plansRef = collection(db, 'users', clientId, 'workoutPlans');
  const plansQuery = query(
    plansRef,
    where('date', '==', todayStr),
    limit(1)
  );
  
  return onSnapshot(plansQuery, (snapshot) => {
    if (snapshot.empty) {
      callback({
        type: 'rest_day',
        workout: null,
        message: 'День отдыха',
      });
      return;
    }
    
    const planDoc = snapshot.docs[0];
    const plan = { id: planDoc.id, ...planDoc.data() } as CoachWorkoutPlan;
    const workout = convertCoachPlanToWorkout(plan, clientId);
    
    switch (workout.status) {
      case 'completed':
        callback({
          type: 'completed',
          workout,
          message: 'Тренировка завершена',
        });
        break;
      case 'in_progress':
        callback({
          type: 'in_progress',
          workout,
          message: 'Тренировка в процессе',
        });
        break;
      default:
        callback({
          type: 'scheduled',
          workout,
          message: 'Тренировка запланирована',
        });
    }
  }, () => {
    // Error handler - show rest day
    callback({
      type: 'rest_day',
      workout: null,
      message: 'День отдыха',
    });
  });
}

// ============================================================================
// Workout Execution
// ============================================================================

/**
 * Get workout by ID - now searches in user's workoutPlans
 */
export async function getWorkoutById(workoutId: string, clientId?: string): Promise<ScheduledWorkout | null> {
  if (!clientId) return null;
  
  try {
    const planDoc = await getDoc(doc(db, 'users', clientId, 'workoutPlans', workoutId));
    
    if (planDoc.exists()) {
      const plan = { id: planDoc.id, ...planDoc.data() } as CoachWorkoutPlan;
      return convertCoachPlanToWorkout(plan, clientId);
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// Alias for WorkoutExecution compatibility
export const getWorkout = getWorkoutById;

/**
 * Update set completion status
 */
export async function updateSetCompletion(
  workoutId: string,
  exerciseId: string,
  setIndex: number,
  completed: boolean,
  clientId?: string
): Promise<void> {
  if (!clientId) return;
  
  const workout = await getWorkoutById(workoutId, clientId);
  
  if (!workout) {
    throw new Error('Workout not found');
  }
  
  const results = workout.results || [];
  let exerciseResult = results.find(r => r.exerciseId === exerciseId);
  
  if (!exerciseResult) {
    exerciseResult = {
      exerciseId,
      sets: [],
      completed: false,
    };
    results.push(exerciseResult);
  }
  
  // Ensure sets array is long enough
  while (exerciseResult.sets.length <= setIndex) {
    exerciseResult.sets.push({
      setNumber: exerciseResult.sets.length + 1,
      completed: false,
    });
  }
  
  exerciseResult.sets[setIndex] = {
    ...exerciseResult.sets[setIndex],
    completed,
  };
  
  await updateDoc(doc(db, 'users', clientId, 'workoutPlans', workoutId), {
    results,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Start workout session
 */
export async function startWorkout(workoutId: string, clientId?: string): Promise<void> {
  if (!clientId) return;
  
  await updateDoc(doc(db, 'users', clientId, 'workoutPlans', workoutId), {
    status: 'in_progress',
    startedAt: new Date().toISOString(),
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Save set result with weight and reps
 */
export async function saveSetResult(
  workoutId: string,
  exerciseId: string,
  setIndex: number,
  data: { weight: number; reps: number; completed: boolean },
  clientId?: string
): Promise<void> {
  if (!clientId) return;
  
  const workout = await getWorkoutById(workoutId, clientId);
  
  if (!workout) {
    throw new Error('Workout not found');
  }
  
  const results = workout.results || [];
  let exerciseResult = results.find(r => r.exerciseId === exerciseId);
  
  if (!exerciseResult) {
    exerciseResult = {
      exerciseId,
      sets: [],
      completed: false,
    };
    results.push(exerciseResult);
  }
  
  // Ensure sets array is long enough
  while (exerciseResult.sets.length <= setIndex) {
    exerciseResult.sets.push({
      setNumber: exerciseResult.sets.length + 1,
      completed: false,
    });
  }
  
  exerciseResult.sets[setIndex] = {
    setNumber: setIndex + 1,
    completed: data.completed,
    weight: data.weight,
    reps: data.reps,
  };
  
  // Check if all sets completed for this exercise
  const exercise = workout.exercises.find(e => e.id === exerciseId);
  if (exercise) {
    exerciseResult.completed = exerciseResult.sets.filter(s => s.completed).length >= exercise.sets;
  }
  
  await updateDoc(doc(db, 'users', clientId, 'workoutPlans', workoutId), {
    results,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Update session progress (for resume)
 */
export async function updateSessionProgress(
  workoutId: string,
  exerciseIndex: number,
  setIndex: number,
  clientId?: string
): Promise<void> {
  if (!clientId) return;
  
  await updateDoc(doc(db, 'users', clientId, 'workoutPlans', workoutId), {
    currentExerciseIndex: exerciseIndex,
    currentSetIndex: setIndex,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Subscribe to workout changes (for real-time updates)
 */
export function subscribeToWorkout(
  workoutId: string,
  callback: (workout: ScheduledWorkout | null) => void,
  clientId?: string
): () => void {
  if (!clientId) {
    callback(null);
    return () => {};
  }
  
  return onSnapshot(doc(db, 'users', clientId, 'workoutPlans', workoutId), (snapshot) => {
    if (snapshot.exists()) {
      const plan = { id: snapshot.id, ...snapshot.data() } as CoachWorkoutPlan;
      callback(convertCoachPlanToWorkout(plan, clientId));
    } else {
      callback(null);
    }
  });
}

/**
 * Update exercise result
 */
export async function updateExerciseResult(
  workoutId: string,
  exerciseResult: ExerciseResult,
  clientId?: string
): Promise<void> {
  if (!clientId) return;
  
  const planDoc = await getDoc(doc(db, 'users', clientId, 'workoutPlans', workoutId));
  
  if (!planDoc.exists()) {
    throw new Error('Workout not found');
  }
  
  const plan = planDoc.data();
  const results = plan.results || [];
  
  // Update or add exercise result
  const existingIndex = results.findIndex((r: ExerciseResult) => r.exerciseId === exerciseResult.exerciseId);
  if (existingIndex >= 0) {
    results[existingIndex] = exerciseResult;
  } else {
    results.push(exerciseResult);
  }
  
  await updateDoc(doc(db, 'users', clientId, 'workoutPlans', workoutId), {
    results,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Complete workout session
 */
export async function completeWorkout(
  workoutId: string,
  data: {
    results: ExerciseResult[];
    clientNotes?: string;
    clientRating?: number;
  },
  clientId?: string
): Promise<void> {
  if (!clientId) return;
  
  const workout = await getWorkoutById(workoutId, clientId);
  
  if (!workout) {
    throw new Error('Workout not found');
  }
  
  const startTime = workout.startedAt ? new Date(workout.startedAt) : new Date();
  const endTime = new Date();
  const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
  
  await updateDoc(doc(db, 'users', clientId, 'workoutPlans', workoutId), {
    status: 'completed',
    completedAt: endTime.toISOString(),
    duration,
    results: data.results,
    clientNotes: data.clientNotes,
    clientRating: data.clientRating,
    updatedAt: endTime.toISOString(),
  });
}

/**
 * Add video to exercise result
 */
export async function addExerciseVideo(
  workoutId: string,
  exerciseId: string,
  videoUrl: string,
  clientId?: string
): Promise<void> {
  if (!clientId) return;
  
  const workout = await getWorkoutById(workoutId, clientId);
  
  if (!workout) {
    throw new Error('Workout not found');
  }
  
  const results = workout.results || [];
  const existingIndex = results.findIndex(r => r.exerciseId === exerciseId);
  
  if (existingIndex >= 0) {
    results[existingIndex].videoUrl = videoUrl;
  } else {
    results.push({
      exerciseId,
      sets: [],
      completed: false,
      videoUrl,
    });
  }
  
  await updateDoc(doc(db, 'users', clientId, 'workoutPlans', workoutId), {
    results,
    updatedAt: new Date().toISOString(),
  });
}

// ============================================================================
// Trainer Functions
// ============================================================================

/**
 * Create scheduled workout (trainer use) - saves to user's workoutPlans
 */
export async function createScheduledWorkout(
  data: Omit<ScheduledWorkout, 'id' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const workoutId = 'workout_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  const now = new Date().toISOString();
  
  // Convert to coach plan format
  const plan = {
    date: data.scheduledDate,
    title: data.title,
    exercises: data.exercises.map(ex => ({
      id: ex.id,
      name: ex.name.ru || ex.name.en,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      restSeconds: ex.restTime,
      notes: ex.notes,
      videoUrl: ex.videoUrl,
    })),
    status: 'planned',
    createdAt: now,
  };
  
  await setDoc(doc(db, 'users', data.clientId, 'workoutPlans', workoutId), plan);
  
  return workoutId;
}

/**
 * Get upcoming workouts for a client
 */
export async function getUpcomingWorkouts(
  clientId: string,
  days: number = 7
): Promise<ScheduledWorkout[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);
  const futureStr = futureDate.toISOString().split('T')[0];
  
  try {
    const plansRef = collection(db, 'users', clientId, 'workoutPlans');
    const plansQuery = query(
      plansRef,
      where('date', '>=', todayStr),
      where('date', '<=', futureStr),
      orderBy('date', 'asc')
    );
    
    const snapshot = await getDocs(plansQuery);
    
    return snapshot.docs.map(docSnap => {
      const plan = { id: docSnap.id, ...docSnap.data() } as CoachWorkoutPlan;
      return convertCoachPlanToWorkout(plan, clientId);
    });
  } catch (error) {
    return [];
  }
}

/**
 * Get past workouts for a client
 */
export async function getPastWorkouts(
  clientId: string,
  limitCount: number = 10
): Promise<ScheduledWorkout[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  try {
    const plansRef = collection(db, 'users', clientId, 'workoutPlans');
    const plansQuery = query(
      plansRef,
      where('date', '<', todayStr),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(plansQuery);
    
    return snapshot.docs.map(docSnap => {
      const plan = { id: docSnap.id, ...docSnap.data() } as CoachWorkoutPlan;
      return convertCoachPlanToWorkout(plan, clientId);
    });
  } catch (error) {
    return [];
  }
}

/**
 * Get all workouts for a client (for trainer view)
 */
export async function getClientWorkouts(
  clientId: string,
  limitCount: number = 30
): Promise<ScheduledWorkout[]> {
  try {
    const plansRef = collection(db, 'users', clientId, 'workoutPlans');
    const plansQuery = query(
      plansRef,
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(plansQuery);
    
    return snapshot.docs.map(docSnap => {
      const plan = { id: docSnap.id, ...docSnap.data() } as CoachWorkoutPlan;
      return convertCoachPlanToWorkout(plan, clientId);
    });
  } catch (error) {
    return [];
  }
}

/**
 * Add client note to completed workout
 */
export async function addClientNote(
  workoutId: string,
  clientId: string,
  note: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', clientId, 'workoutPlans', workoutId), {
      clientNotes: note,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving client note:', error);
    throw error;
  }
}
