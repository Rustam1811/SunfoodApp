/**
 * Admin Service - Coach/Admin Panel Firestore Operations
 * 
 * Multi-tenant ready service for managing:
 * - Clients
 * - Workout plans
 * - Nutrition targets
 * - Water targets
 * - Coach notes
 * - Exercise library
 * 
 * Path patterns:
 * - tenants/{tenantId}/clients/{clientId}
 * - tenants/{tenantId}/clients/{clientId}/plans/{date}
 * - tenants/{tenantId}/clients/{clientId}/nutrition/{id}
 * - tenants/{tenantId}/clients/{clientId}/water/{id}
 * - tenants/{tenantId}/clients/{clientId}/notes/{noteId}
 * - tenants/{tenantId}/exercises/{exerciseId}
 * - exercises/{exerciseId} (global)
 * 
 * @module admin/services/adminService
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  Timestamp,
  type Unsubscribe,
  type DocumentData,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import type {
  ExerciseFormData,
  WorkoutPlanFormData,
  PlannedExerciseFormData,
  NutritionTargetsFormData,
  WaterTargetFormData,
  CoachNoteFormData,
  ClientProfileFormData,
  DayOfWeek,
} from '../schemas';

// ============================================================================
// Types
// ============================================================================

export interface Client {
  id: string;
  phone: string;
  name: string;
  email?: string;
  tenantId: string;
  trainerId?: string;
  role: 'client' | 'coach' | 'admin';
  onboardingCompleted: boolean;
  height?: number;
  weight?: number;
  goal?: string;
  level?: string;
  createdAt: string;
  isActive: boolean;
  avatarUrl?: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  description: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  equipment: string[];
  muscleGroups: string[];
  difficulty?: string;
  instructions: string[];
  createdBy: string;
  isGlobal: boolean;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutPlan {
  id: string;
  clientId: string;
  trainerId: string;
  tenantId: string;
  date: string;
  title: string;
  description?: string;
  exercises: PlannedExerciseFormData[];
  estimatedDuration: number;
  difficulty: 'easy' | 'moderate' | 'hard';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NutritionTargets {
  id: string;
  clientId: string;
  coachId: string;
  tenantId: string;
  dailyMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  mealDistribution: {
    breakfast: number;
    lunch: number;
    dinner: number;
    snacks: number;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WaterTarget {
  id: string;
  clientId: string;
  coachId: string;
  tenantId: string;
  dailyLiters: number;
  cupSizeMl: number;
  remindersEnabled: boolean;
  reminderIntervalMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CoachNote {
  id: string;
  clientId: string;
  coachId: string;
  tenantId: string;
  type: 'daily' | 'weekly' | 'workout' | 'nutrition' | 'general';
  date?: string;
  weekStartDate?: string;
  title: string;
  content: string;
  isPrivate: boolean;
  priority: 'low' | 'normal' | 'high';
  attachments: Array<{
    type: 'image' | 'video' | 'document';
    url: string;
    name: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface WeekSchedule {
  id: string;
  clientId: string;
  tenantId: string;
  weekStartDate: string;
  days: Record<DayOfWeek, {
    isRestDay: boolean;
    planId?: string;
    title?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TENANT = 'default';

// ============================================================================
// Helper Functions
// ============================================================================

function getTenantsPath(tenantId: string = DEFAULT_TENANT): string {
  return `tenants/${tenantId}`;
}

function getClientsPath(tenantId: string = DEFAULT_TENANT): string {
  return `${getTenantsPath(tenantId)}/clients`;
}

function getClientPath(tenantId: string, clientId: string): string {
  return `${getClientsPath(tenantId)}/${clientId}`;
}

function normalizeTimestamp(data: Record<string, unknown> | DocumentData): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      result[key] = value.toDate().toISOString();
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = normalizeTimestamp(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// ============================================================================
// Client Operations
// ============================================================================

/**
 * Get all clients for a tenant
 */
export async function getClients(
  tenantId: string = DEFAULT_TENANT,
  trainerId?: string
): Promise<Client[]> {
  try {
    const clientsRef = collection(db, getClientsPath(tenantId));
    
    let q;
    if (trainerId) {
      q = query(
        clientsRef,
        where('trainerId', '==', trainerId),
        where('role', '==', 'client'),
        orderBy('name', 'asc')
      );
    } else {
      q = query(
        clientsRef,
        where('role', '==', 'client'),
        orderBy('name', 'asc')
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...normalizeTimestamp(doc.data()),
    } as Client));
  } catch (error) {
    console.error('Error getting clients:', error);
    return [];
  }
}

/**
 * Get single client by ID
 */
export async function getClient(
  clientId: string,
  tenantId: string = DEFAULT_TENANT
): Promise<Client | null> {
  try {
    const docRef = doc(db, getClientPath(tenantId, clientId));
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    return {
      id: docSnap.id,
      ...normalizeTimestamp(docSnap.data()),
    } as Client;
  } catch (error) {
    console.error('Error getting client:', error);
    return null;
  }
}

/**
 * Update client profile
 */
export async function updateClient(
  clientId: string,
  data: Partial<ClientProfileFormData>,
  tenantId: string = DEFAULT_TENANT
): Promise<void> {
  const docRef = doc(db, getClientPath(tenantId, clientId));
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Subscribe to clients list
 */
export function subscribeToClients(
  callback: (clients: Client[]) => void,
  tenantId: string = DEFAULT_TENANT,
  trainerId?: string
): Unsubscribe {
  const clientsRef = collection(db, getClientsPath(tenantId));
  
  let q;
  if (trainerId) {
    q = query(
      clientsRef,
      where('trainerId', '==', trainerId),
      where('role', '==', 'client'),
      orderBy('name', 'asc')
    );
  } else {
    q = query(
      clientsRef,
      where('role', '==', 'client'),
      orderBy('name', 'asc')
    );
  }
  
  return onSnapshot(q, (snapshot) => {
    const clients = snapshot.docs.map(doc => ({
      id: doc.id,
      ...normalizeTimestamp(doc.data()),
    } as Client));
    callback(clients);
  });
}

// ============================================================================
// Exercise Library Operations
// ============================================================================

/**
 * Get all exercises (global + tenant-specific)
 */
export async function getExercises(
  tenantId: string = DEFAULT_TENANT,
  coachId?: string
): Promise<Exercise[]> {
  try {
    const exercises: Exercise[] = [];
    
    // Get global exercises
    const globalQuery = query(
      collection(db, 'exercises'),
      where('isGlobal', '==', true),
      orderBy('name', 'asc')
    );
    const globalSnap = await getDocs(globalQuery);
    exercises.push(...globalSnap.docs.map(doc => ({
      id: doc.id,
      ...normalizeTimestamp(doc.data()),
    } as Exercise)));
    
    // Get tenant exercises
    const tenantQuery = query(
      collection(db, `${getTenantsPath(tenantId)}/exercises`),
      orderBy('name', 'asc')
    );
    const tenantSnap = await getDocs(tenantQuery);
    exercises.push(...tenantSnap.docs.map(doc => ({
      id: doc.id,
      ...normalizeTimestamp(doc.data()),
    } as Exercise)));
    
    // Get coach-specific exercises if coachId provided
    if (coachId) {
      const coachQuery = query(
        collection(db, 'exercises'),
        where('createdBy', '==', coachId),
        where('isGlobal', '==', false),
        orderBy('name', 'asc')
      );
      const coachSnap = await getDocs(coachQuery);
      exercises.push(...coachSnap.docs.map(doc => ({
        id: doc.id,
        ...normalizeTimestamp(doc.data()),
      } as Exercise)));
    }
    
    // Remove duplicates by ID
    const uniqueMap = new Map<string, Exercise>();
    exercises.forEach(ex => uniqueMap.set(ex.id, ex));
    
    return Array.from(uniqueMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error getting exercises:', error);
    return [];
  }
}

/**
 * Create new exercise
 */
export async function createExercise(
  data: ExerciseFormData,
  coachId: string,
  tenantId: string = DEFAULT_TENANT
): Promise<string> {
  const now = new Date().toISOString();
  
  const exerciseData = {
    ...data,
    createdBy: coachId,
    tenantId: data.isGlobal ? undefined : tenantId,
    createdAt: now,
    updatedAt: now,
  };
  
  // Global exercises go to root collection, tenant exercises go to tenant subcollection
  const collectionPath = data.isGlobal 
    ? 'exercises' 
    : `${getTenantsPath(tenantId)}/exercises`;
  
  const docRef = await addDoc(collection(db, collectionPath), exerciseData);
  return docRef.id;
}

/**
 * Update exercise
 */
export async function updateExercise(
  exerciseId: string,
  data: Partial<ExerciseFormData>,
  tenantId: string = DEFAULT_TENANT,
  isGlobal: boolean = false
): Promise<void> {
  const collectionPath = isGlobal 
    ? 'exercises' 
    : `${getTenantsPath(tenantId)}/exercises`;
  
  const docRef = doc(db, collectionPath, exerciseId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete exercise
 */
export async function deleteExercise(
  exerciseId: string,
  tenantId: string = DEFAULT_TENANT,
  isGlobal: boolean = false
): Promise<void> {
  const collectionPath = isGlobal 
    ? 'exercises' 
    : `${getTenantsPath(tenantId)}/exercises`;
  
  const docRef = doc(db, collectionPath, exerciseId);
  await deleteDoc(docRef);
}

/**
 * Upload exercise video
 */
export async function uploadExerciseVideo(
  exerciseId: string,
  file: File,
  tenantId: string = DEFAULT_TENANT
): Promise<string> {
  const ext = file.name.split('.').pop() || 'mp4';
  const storagePath = `tenants/${tenantId}/exercises/${exerciseId}/demo.${ext}`;
  const storageRef = ref(storage, storagePath);
  
  await uploadBytes(storageRef, file);
  const videoUrl = await getDownloadURL(storageRef);
  
  return videoUrl;
}

// ============================================================================
// Workout Plan Operations
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
    const planRef = doc(db, getClientPath(tenantId, clientId), 'plans', date);
    const planSnap = await getDoc(planRef);
    
    if (!planSnap.exists()) return null;
    
    return {
      id: planSnap.id,
      ...normalizeTimestamp(planSnap.data()),
    } as WorkoutPlan;
  } catch (error) {
    console.error('Error getting workout plan:', error);
    return null;
  }
}

/**
 * Get all workout plans for a client (optional date range)
 */
export async function getWorkoutPlans(
  clientId: string,
  tenantId: string = DEFAULT_TENANT,
  startDate?: string,
  endDate?: string
): Promise<WorkoutPlan[]> {
  try {
    const plansRef = collection(db, getClientPath(tenantId, clientId), 'plans');
    
    let q;
    if (startDate && endDate) {
      q = query(
        plansRef,
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'asc')
      );
    } else {
      q = query(plansRef, orderBy('date', 'desc'), limit(30));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...normalizeTimestamp(doc.data()),
    } as WorkoutPlan));
  } catch (error) {
    console.error('Error getting workout plans:', error);
    return [];
  }
}

/**
 * Save workout plan (create or update)
 */
export async function saveWorkoutPlan(
  data: WorkoutPlanFormData,
  tenantId: string = DEFAULT_TENANT
): Promise<string> {
  const now = new Date().toISOString();
  const planId = data.date; // Use date as document ID
  
  const planRef = doc(db, getClientPath(tenantId, data.clientId), 'plans', planId);
  
  const planData = {
    ...data,
    tenantId,
    createdAt: now,
    updatedAt: now,
  };
  
  await setDoc(planRef, planData, { merge: true });
  return planId;
}

/**
 * Delete workout plan
 */
export async function deleteWorkoutPlan(
  clientId: string,
  date: string,
  tenantId: string = DEFAULT_TENANT
): Promise<void> {
  const planRef = doc(db, getClientPath(tenantId, clientId), 'plans', date);
  await deleteDoc(planRef);
}

/**
 * Copy workout plan to another date
 */
export async function copyWorkoutPlan(
  clientId: string,
  sourceDate: string,
  targetDate: string,
  tenantId: string = DEFAULT_TENANT
): Promise<void> {
  const sourcePlan = await getWorkoutPlan(clientId, sourceDate, tenantId);
  if (!sourcePlan) {
    throw new Error('Source plan not found');
  }
  
  const newPlan: WorkoutPlanFormData = {
    ...sourcePlan,
    date: targetDate,
  };
  
  await saveWorkoutPlan(newPlan, tenantId);
}

// ============================================================================
// Week Schedule Operations
// ============================================================================

/**
 * Get week schedule
 */
export async function getWeekSchedule(
  clientId: string,
  weekStartDate: string,
  tenantId: string = DEFAULT_TENANT
): Promise<WeekSchedule | null> {
  try {
    const scheduleRef = doc(
      db,
      getClientPath(tenantId, clientId),
      'schedules',
      weekStartDate
    );
    const scheduleSnap = await getDoc(scheduleRef);
    
    if (!scheduleSnap.exists()) return null;
    
    return {
      id: scheduleSnap.id,
      ...normalizeTimestamp(scheduleSnap.data()),
    } as WeekSchedule;
  } catch (error) {
    console.error('Error getting week schedule:', error);
    return null;
  }
}

/**
 * Save week schedule
 */
export async function saveWeekSchedule(
  clientId: string,
  weekStartDate: string,
  days: WeekSchedule['days'],
  tenantId: string = DEFAULT_TENANT
): Promise<void> {
  const now = new Date().toISOString();
  const scheduleRef = doc(
    db,
    getClientPath(tenantId, clientId),
    'schedules',
    weekStartDate
  );
  
  await setDoc(scheduleRef, {
    clientId,
    tenantId,
    weekStartDate,
    days,
    updatedAt: now,
  }, { merge: true });
}

// ============================================================================
// Nutrition Operations
// ============================================================================

/**
 * Get nutrition targets for a client
 */
export async function getNutritionTargets(
  clientId: string,
  tenantId: string = DEFAULT_TENANT
): Promise<NutritionTargets | null> {
  try {
    const docRef = doc(db, getClientPath(tenantId, clientId), 'nutrition', 'targets');
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    return {
      id: docSnap.id,
      ...normalizeTimestamp(docSnap.data()),
    } as NutritionTargets;
  } catch (error) {
    console.error('Error getting nutrition targets:', error);
    return null;
  }
}

/**
 * Save nutrition targets
 */
export async function saveNutritionTargets(
  data: NutritionTargetsFormData,
  tenantId: string = DEFAULT_TENANT
): Promise<void> {
  const now = new Date().toISOString();
  const docRef = doc(db, getClientPath(tenantId, data.clientId), 'nutrition', 'targets');
  
  await setDoc(docRef, {
    ...data,
    tenantId,
    createdAt: now,
    updatedAt: now,
  }, { merge: true });
}

// ============================================================================
// Water Target Operations
// ============================================================================

/**
 * Get water target for a client
 */
export async function getWaterTarget(
  clientId: string,
  tenantId: string = DEFAULT_TENANT
): Promise<WaterTarget | null> {
  try {
    const docRef = doc(db, getClientPath(tenantId, clientId), 'water', 'target');
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    return {
      id: docSnap.id,
      ...normalizeTimestamp(docSnap.data()),
    } as WaterTarget;
  } catch (error) {
    console.error('Error getting water target:', error);
    return null;
  }
}

/**
 * Save water target
 */
export async function saveWaterTarget(
  data: WaterTargetFormData,
  tenantId: string = DEFAULT_TENANT
): Promise<void> {
  const now = new Date().toISOString();
  const docRef = doc(db, getClientPath(tenantId, data.clientId), 'water', 'target');
  
  await setDoc(docRef, {
    ...data,
    tenantId,
    createdAt: now,
    updatedAt: now,
  }, { merge: true });
}

// ============================================================================
// Coach Notes Operations
// ============================================================================

/**
 * Get coach notes for a client
 */
export async function getCoachNotes(
  clientId: string,
  tenantId: string = DEFAULT_TENANT,
  type?: CoachNote['type']
): Promise<CoachNote[]> {
  try {
    const notesRef = collection(db, getClientPath(tenantId, clientId), 'notes');
    
    let q;
    if (type) {
      q = query(
        notesRef,
        where('type', '==', type),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    } else {
      q = query(notesRef, orderBy('createdAt', 'desc'), limit(50));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...normalizeTimestamp(doc.data()),
    } as CoachNote));
  } catch (error) {
    console.error('Error getting coach notes:', error);
    return [];
  }
}

/**
 * Create coach note
 */
export async function createCoachNote(
  data: CoachNoteFormData,
  tenantId: string = DEFAULT_TENANT
): Promise<string> {
  const now = new Date().toISOString();
  
  const noteData = {
    ...data,
    tenantId,
    createdAt: now,
    updatedAt: now,
  };
  
  const docRef = await addDoc(
    collection(db, getClientPath(tenantId, data.clientId), 'notes'),
    noteData
  );
  return docRef.id;
}

/**
 * Update coach note
 */
export async function updateCoachNote(
  clientId: string,
  noteId: string,
  data: Partial<CoachNoteFormData>,
  tenantId: string = DEFAULT_TENANT
): Promise<void> {
  const docRef = doc(db, getClientPath(tenantId, clientId), 'notes', noteId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete coach note
 */
export async function deleteCoachNote(
  clientId: string,
  noteId: string,
  tenantId: string = DEFAULT_TENANT
): Promise<void> {
  const docRef = doc(db, getClientPath(tenantId, clientId), 'notes', noteId);
  await deleteDoc(docRef);
}

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Copy all plans from one week to another
 */
export async function copyWeekPlans(
  clientId: string,
  sourceWeekStart: string,
  targetWeekStart: string,
  tenantId: string = DEFAULT_TENANT
): Promise<void> {
  const sourcePlans = await getWorkoutPlans(
    clientId,
    tenantId,
    sourceWeekStart,
    addDays(sourceWeekStart, 6)
  );
  
  const batch = writeBatch(db);
  
  sourcePlans.forEach((plan, index) => {
    const targetDate = addDays(targetWeekStart, index);
    const targetRef = doc(db, getClientPath(tenantId, clientId), 'plans', targetDate);
    
    batch.set(targetRef, {
      ...plan,
      date: targetDate,
      updatedAt: new Date().toISOString(),
    });
  });
  
  await batch.commit();
}

// Helper to add days to date string
function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}
