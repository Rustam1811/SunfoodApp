/**
 * Workout Plan Service - Read workout plans from Firestore
 *
 * Path: tenants/{tenantId}/clients/{uid}/plans/{date}
 *
 * @module services/workoutPlanService
 */

import {
  doc,
  getDoc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ============================================================================
// Types
// ============================================================================

export type SetStatus = 'pending' | 'completed' | 'skipped';

export interface PlannedSet {
  setNumber: number;
  targetReps: number;
  targetWeight: number;
  restSeconds: number;
}

export interface PlannedExercise {
  id: string;
  exerciseId: string;
  name: string;
  description?: string;
  coachVideoUrl?: string;
  thumbnailUrl?: string;
  targetMuscles?: string[];
  equipment?: string;
  sets: PlannedSet[];
  notes?: string;
  order: number;
}

export interface WorkoutPlan {
  id: string;
  clientId: string;
  trainerId: string;
  tenantId: string;
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
  exercises: PlannedExercise[];
  estimatedDuration: number; // minutes
  difficulty: 'easy' | 'moderate' | 'hard';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TENANT = 'default';

// ============================================================================
// Plan Retrieval
// ============================================================================

/**
 * Get workout plan for a specific date
 */
export async function getWorkoutPlan(
  clientId: string,
  date: string,
  tenantId: string = DEFAULT_TENANT
): Promise<WorkoutPlan | null> {
  try {
    const planRef = doc(db, 'tenants', tenantId, 'clients', clientId, 'plans', date);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      return null;
    }

    return {
      id: planSnap.id,
      ...planSnap.data(),
    } as WorkoutPlan;
  } catch {
    return null;
  }
}

/**
 * Subscribe to workout plan for a specific date
 */
export function subscribeToWorkoutPlan(
  clientId: string,
  date: string,
  callback: (plan: WorkoutPlan | null) => void,
  tenantId: string = DEFAULT_TENANT
): Unsubscribe {
  const planRef = doc(db, 'tenants', tenantId, 'clients', clientId, 'plans', date);

  return onSnapshot(
    planRef,
    (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }
      callback({
        id: snap.id,
        ...snap.data(),
      } as WorkoutPlan);
    },
    () => {
      callback(null);
    }
  );
}

/**
 * Get today's workout plan
 */
export async function getTodayPlan(
  clientId: string,
  tenantId: string = DEFAULT_TENANT
): Promise<WorkoutPlan | null> {
  const today = new Date().toISOString().split('T')[0];
  return getWorkoutPlan(clientId, today, tenantId);
}

/**
 * Subscribe to today's workout plan
 */
export function subscribeToTodayPlan(
  clientId: string,
  callback: (plan: WorkoutPlan | null) => void,
  tenantId: string = DEFAULT_TENANT
): Unsubscribe {
  const today = new Date().toISOString().split('T')[0];
  return subscribeToWorkoutPlan(clientId, today, callback, tenantId);
}

/**
 * Get upcoming workout plans (next 7 days)
 */
export async function getUpcomingPlans(
  clientId: string,
  tenantId: string = DEFAULT_TENANT,
  days: number = 7
): Promise<WorkoutPlan[]> {
  try {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + days);

    const todayStr = today.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const plansRef = collection(db, 'tenants', tenantId, 'clients', clientId, 'plans');
    const q = query(
      plansRef,
      where('date', '>=', todayStr),
      where('date', '<=', endDateStr),
      orderBy('date', 'asc'),
      limit(days)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as WorkoutPlan[];
  } catch {
    return [];
  }
}

// ============================================================================
// Exercise Lookup
// ============================================================================

export interface ExerciseLibraryItem {
  id: string;
  name: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  targetMuscles: string[];
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Get exercise details from library
 */
export async function getExerciseFromLibrary(
  exerciseId: string,
  tenantId: string = DEFAULT_TENANT
): Promise<ExerciseLibraryItem | null> {
  try {
    const exerciseRef = doc(db, 'tenants', tenantId, 'exerciseLibrary', exerciseId);
    const exerciseSnap = await getDoc(exerciseRef);

    if (!exerciseSnap.exists()) {
      return null;
    }

    return {
      id: exerciseSnap.id,
      ...exerciseSnap.data(),
    } as ExerciseLibraryItem;
  } catch {
    return null;
  }
}
