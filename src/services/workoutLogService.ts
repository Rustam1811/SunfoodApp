/**
 * Workout Log Service - Write workout logs to Firestore
 *
 * Path: tenants/{tenantId}/clients/{uid}/workoutLogs/{date}/entries
 *
 * Handles:
 * - Active session state (resume after leaving)
 * - Set completion logging
 * - Exercise results with video uploads
 * - Workout completion
 *
 * @module services/workoutLogService
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  type UploadTask,
} from 'firebase/storage';
import { db, storage } from '../lib/firebase';

// ============================================================================
// Types
// ============================================================================

export type SetStatus = 'pending' | 'completed' | 'skipped';

export interface LoggedSet {
  setNumber: number;
  status: SetStatus;
  targetReps: number;
  targetWeight: number;
  actualReps?: number;
  actualWeight?: number;
  restTaken?: number; // actual rest in seconds
  completedAt?: string;
  notes?: string;
}

export interface ExerciseLogEntry {
  id?: string;
  exerciseId: string;
  exerciseName: string;
  sets: LoggedSet[];
  clientVideoUrl?: string;
  clientVideoThumbnail?: string;
  notes?: string;
  startedAt: string;
  completedAt?: string;
}

export interface ActiveSession {
  id: string;
  planId: string;
  planDate: string;
  clientId: string;
  tenantId: string;
  currentExerciseIndex: number;
  currentSetIndex: number;
  status: 'in_progress' | 'paused';
  startedAt: string;
  lastActivityAt: string;
  exerciseResults: ExerciseLogEntry[];
}

export interface WorkoutLogSummary {
  id: string;
  planId: string;
  planDate: string;
  planTitle: string;
  clientId: string;
  tenantId: string;
  totalExercises: number;
  completedExercises: number;
  totalSets: number;
  completedSets: number;
  skippedSets: number;
  duration: number; // seconds
  startedAt: string;
  completedAt: string;
  clientNotes?: string;
  clientRating?: number; // 1-5
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TENANT = 'default';
const ACTIVE_SESSION_DOC = 'activeSession';

// ============================================================================
// Active Session Management
// ============================================================================

/**
 * Get active session for a client (for resume functionality)
 */
export async function getActiveSession(
  clientId: string,
  tenantId: string = DEFAULT_TENANT
): Promise<ActiveSession | null> {
  try {
    const sessionRef = doc(
      db,
      'tenants',
      tenantId,
      'clients',
      clientId,
      'sessions',
      ACTIVE_SESSION_DOC
    );
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      return null;
    }

    return sessionSnap.data() as ActiveSession;
  } catch {
    return null;
  }
}

/**
 * Subscribe to active session (real-time updates for resume)
 */
export function subscribeToActiveSession(
  clientId: string,
  callback: (session: ActiveSession | null) => void,
  tenantId: string = DEFAULT_TENANT
): Unsubscribe {
  const sessionRef = doc(
    db,
    'tenants',
    tenantId,
    'clients',
    clientId,
    'sessions',
    ACTIVE_SESSION_DOC
  );

  return onSnapshot(
    sessionRef,
    (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }
      callback(snap.data() as ActiveSession);
    },
    () => {
      callback(null);
    }
  );
}

/**
 * Start a new workout session
 */
export async function startWorkoutSession(
  clientId: string,
  planId: string,
  planDate: string,
  tenantId: string = DEFAULT_TENANT
): Promise<ActiveSession> {
  const now = new Date().toISOString();

  const session: ActiveSession = {
    id: `${planId}-${Date.now()}`,
    planId,
    planDate,
    clientId,
    tenantId,
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    status: 'in_progress',
    startedAt: now,
    lastActivityAt: now,
    exerciseResults: [],
  };

  const sessionRef = doc(
    db,
    'tenants',
    tenantId,
    'clients',
    clientId,
    'sessions',
    ACTIVE_SESSION_DOC
  );

  await setDoc(sessionRef, session);

  return session;
}

/**
 * Update session progress (for resume after leaving)
 */
export async function updateSessionProgress(
  clientId: string,
  exerciseIndex: number,
  setIndex: number,
  exerciseResults: ExerciseLogEntry[],
  tenantId: string = DEFAULT_TENANT
): Promise<void> {
  const sessionRef = doc(
    db,
    'tenants',
    tenantId,
    'clients',
    clientId,
    'sessions',
    ACTIVE_SESSION_DOC
  );

  await updateDoc(sessionRef, {
    currentExerciseIndex: exerciseIndex,
    currentSetIndex: setIndex,
    exerciseResults,
    lastActivityAt: new Date().toISOString(),
  });
}

/**
 * Clear active session (on workout completion)
 */
export async function clearActiveSession(
  clientId: string,
  tenantId: string = DEFAULT_TENANT
): Promise<void> {
  const sessionRef = doc(
    db,
    'tenants',
    tenantId,
    'clients',
    clientId,
    'sessions',
    ACTIVE_SESSION_DOC
  );

  await deleteDoc(sessionRef);
}

// ============================================================================
// Set Logging
// ============================================================================

/**
 * Log a completed/skipped set
 */
export async function logSetCompletion(
  clientId: string,
  exerciseIndex: number,
  exerciseId: string,
  exerciseName: string,
  set: LoggedSet,
  currentResults: ExerciseLogEntry[],
  tenantId: string = DEFAULT_TENANT
): Promise<ExerciseLogEntry[]> {
  // Clone results to avoid mutation
  const results = [...currentResults];

  // Find or create exercise entry
  let exerciseEntry = results.find((r) => r.exerciseId === exerciseId);
  const entryIndex = results.findIndex((r) => r.exerciseId === exerciseId);

  if (!exerciseEntry) {
    exerciseEntry = {
      exerciseId,
      exerciseName,
      sets: [],
      startedAt: new Date().toISOString(),
    };
    results.push(exerciseEntry);
  } else {
    exerciseEntry = { ...exerciseEntry, sets: [...exerciseEntry.sets] };
    results[entryIndex] = exerciseEntry;
  }

  // Update or add set
  const setIdx = exerciseEntry.sets.findIndex((s) => s.setNumber === set.setNumber);
  if (setIdx >= 0) {
    exerciseEntry.sets[setIdx] = set;
  } else {
    exerciseEntry.sets.push(set);
  }

  // Sort sets by number
  exerciseEntry.sets.sort((a, b) => a.setNumber - b.setNumber);

  return results;
}

// ============================================================================
// Video Upload
// ============================================================================

export interface VideoUploadProgress {
  progress: number; // 0-100
  bytesTransferred: number;
  totalBytes: number;
}

export interface VideoUploadResult {
  downloadUrl: string;
  storagePath: string;
}

/**
 * Upload client video for an exercise
 */
export function uploadExerciseVideo(
  clientId: string,
  exerciseId: string,
  file: File,
  tenantId: string = DEFAULT_TENANT,
  onProgress?: (progress: VideoUploadProgress) => void
): { task: UploadTask; promise: Promise<VideoUploadResult> } {
  const timestamp = Date.now();
  const extension = file.name.split('.').pop() || 'mp4';
  const storagePath = `tenants/${tenantId}/clients/${clientId}/videos/${exerciseId}_${timestamp}.${extension}`;

  const storageRef = ref(storage, storagePath);
  const task = uploadBytesResumable(storageRef, file);

  const promise = new Promise<VideoUploadResult>((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.({
          progress,
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
        });
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(task.snapshot.ref);
        resolve({ downloadUrl, storagePath });
      }
    );
  });

  return { task, promise };
}

// ============================================================================
// Workout Completion
// ============================================================================

/**
 * Complete workout and save final log
 */
export async function completeWorkout(
  clientId: string,
  session: ActiveSession,
  planTitle: string,
  totalExercises: number,
  totalSets: number,
  clientNotes?: string,
  clientRating?: number,
  tenantId: string = DEFAULT_TENANT
): Promise<WorkoutLogSummary> {
  const now = new Date().toISOString();
  const startedAt = new Date(session.startedAt);
  const duration = Math.floor((Date.now() - startedAt.getTime()) / 1000);

  // Calculate completion stats
  const completedExercises = session.exerciseResults.filter(
    (e) => e.sets.some((s) => s.status === 'completed')
  ).length;

  const completedSets = session.exerciseResults.reduce(
    (sum, e) => sum + e.sets.filter((s) => s.status === 'completed').length,
    0
  );

  const skippedSets = session.exerciseResults.reduce(
    (sum, e) => sum + e.sets.filter((s) => s.status === 'skipped').length,
    0
  );

  // Create summary
  const summary: WorkoutLogSummary = {
    id: session.id,
    planId: session.planId,
    planDate: session.planDate,
    planTitle,
    clientId,
    tenantId,
    totalExercises,
    completedExercises,
    totalSets,
    completedSets,
    skippedSets,
    duration,
    startedAt: session.startedAt,
    completedAt: now,
    clientNotes,
    clientRating,
  };

  // Save to workoutLogs/{date}
  const logRef = doc(
    db,
    'tenants',
    tenantId,
    'clients',
    clientId,
    'workoutLogs',
    session.planDate
  );

  await setDoc(logRef, summary);

  // Save individual exercise entries
  const entriesRef = collection(logRef, 'entries');
  for (const entry of session.exerciseResults) {
    await addDoc(entriesRef, {
      ...entry,
      completedAt: now,
    });
  }

  // Clear active session
  await clearActiveSession(clientId, tenantId);

  return summary;
}

/**
 * Get workout log for a specific date
 */
export async function getWorkoutLog(
  clientId: string,
  date: string,
  tenantId: string = DEFAULT_TENANT
): Promise<WorkoutLogSummary | null> {
  try {
    const logRef = doc(
      db,
      'tenants',
      tenantId,
      'clients',
      clientId,
      'workoutLogs',
      date
    );
    const logSnap = await getDoc(logRef);

    if (!logSnap.exists()) {
      return null;
    }

    return logSnap.data() as WorkoutLogSummary;
  } catch {
    return null;
  }
}

/**
 * Get workout log entries for a specific date
 */
export async function getWorkoutLogEntries(
  clientId: string,
  date: string,
  tenantId: string = DEFAULT_TENANT
): Promise<ExerciseLogEntry[]> {
  try {
    const entriesRef = collection(
      db,
      'tenants',
      tenantId,
      'clients',
      clientId,
      'workoutLogs',
      date,
      'entries'
    );
    const q = query(entriesRef, orderBy('startedAt', 'asc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as ExerciseLogEntry[];
  } catch {
    return [];
  }
}

/**
 * Subscribe to workout log entries (real-time)
 */
export function subscribeToWorkoutLogEntries(
  clientId: string,
  date: string,
  callback: (entries: ExerciseLogEntry[]) => void,
  tenantId: string = DEFAULT_TENANT
): Unsubscribe {
  const entriesRef = collection(
    db,
    'tenants',
    tenantId,
    'clients',
    clientId,
    'workoutLogs',
    date,
    'entries'
  );
  const q = query(entriesRef, orderBy('startedAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const entries = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ExerciseLogEntry[];
      callback(entries);
    },
    () => {
      callback([]);
    }
  );
}
