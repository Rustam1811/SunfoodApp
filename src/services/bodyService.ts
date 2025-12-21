/**
 * Body Metrics Service - Trainer OS
 * 
 * Manages client body measurements and personal records.
 * No "hospital-like" charts - simple data.
 * 
 * @module services/bodyService
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ============================================================================
// Types
// ============================================================================

export interface Measurements {
  chest?: number; // cm
  waist?: number;
  hips?: number;
  biceps?: number;
  thighs?: number;
  neck?: number;
  forearm?: number;
  calf?: number;
}

export interface BodyMetric {
  id: string;
  clientId: string;
  date: string; // YYYY-MM-DD
  weight?: number; // kg
  measurements?: Measurements;
  bodyFat?: number; // %
  photos?: string[]; // URLs
  notes?: string;
  createdBy: 'client' | 'coach';
  createdAt: string;
}

export interface PersonalRecord {
  id: string;
  clientId: string;
  exerciseId: string;
  exerciseName: string;
  weight: number; // kg
  reps: number;
  date: string;
  previousRecord?: {
    weight: number;
    reps: number;
    date: string;
  };
  createdAt: string;
}

export interface BodySummary {
  currentWeight?: number;
  weightChange?: number; // vs previous
  latestMeasurements?: Measurements;
  measurementsDate?: string;
  personalRecordsCount: number;
  latestRecord?: PersonalRecord;
}

// ============================================================================
// Constants
// ============================================================================

const METRICS_COLLECTION = 'bodyMetrics';
const RECORDS_COLLECTION = 'personalRecords';

// ============================================================================
// Body Metrics CRUD
// ============================================================================

/**
 * Save body metrics
 */
export async function saveBodyMetric(
  clientId: string,
  data: {
    weight?: number;
    measurements?: Measurements;
    bodyFat?: number;
    photos?: string[];
    notes?: string;
  },
  createdBy: 'client' | 'coach',
  date?: string
): Promise<string> {
  const metricDate = date || new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();
  
  const metricData: Omit<BodyMetric, 'id'> = {
    clientId,
    date: metricDate,
    ...data,
    createdBy,
    createdAt: now,
  };
  
  const docRef = await addDoc(collection(db, METRICS_COLLECTION), metricData);
  return docRef.id;
}

/**
 * Get latest body metric for client
 */
export async function getLatestBodyMetric(clientId: string): Promise<BodyMetric | null> {
  try {
    const metricsQuery = query(
      collection(db, METRICS_COLLECTION),
      where('clientId', '==', clientId),
      orderBy('date', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(metricsQuery);
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as BodyMetric;
  } catch (error) {
    console.error('Error getting latest body metric:', error);
    return null;
  }
}

/**
 * Get body metrics history
 */
export async function getBodyMetricsHistory(
  clientId: string,
  limitCount: number = 30
): Promise<BodyMetric[]> {
  try {
    const metricsQuery = query(
      collection(db, METRICS_COLLECTION),
      where('clientId', '==', clientId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(metricsQuery);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as BodyMetric));
  } catch (error) {
    console.error('Error getting body metrics history:', error);
    return [];
  }
}

/**
 * Get weight history for chart
 */
export async function getWeightHistory(
  clientId: string,
  days: number = 30
): Promise<{ date: string; weight: number }[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];
  
  try {
    const metricsQuery = query(
      collection(db, METRICS_COLLECTION),
      where('clientId', '==', clientId),
      where('date', '>=', startDateStr),
      orderBy('date', 'asc')
    );
    
    const snapshot = await getDocs(metricsQuery);
    
    return snapshot.docs
      .map(d => {
        const data = d.data() as BodyMetric;
        return data.weight ? { date: data.date, weight: data.weight } : null;
      })
      .filter((item): item is { date: string; weight: number } => item !== null);
  } catch (error) {
    console.error('Error getting weight history:', error);
    return [];
  }
}

/**
 * Delete body metric
 */
export async function deleteBodyMetric(metricId: string): Promise<void> {
  const docRef = doc(db, METRICS_COLLECTION, metricId);
  await deleteDoc(docRef);
}

// ============================================================================
// Personal Records CRUD
// ============================================================================

/**
 * Save personal record
 */
export async function savePersonalRecord(
  clientId: string,
  exerciseId: string,
  exerciseName: string,
  weight: number,
  reps: number,
  date?: string
): Promise<string> {
  const recordDate = date || new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();
  
  // Get previous record for this exercise
  const previousRecord = await getExerciseRecord(clientId, exerciseId);
  
  const recordData: Omit<PersonalRecord, 'id'> = {
    clientId,
    exerciseId,
    exerciseName,
    weight,
    reps,
    date: recordDate,
    previousRecord: previousRecord ? {
      weight: previousRecord.weight,
      reps: previousRecord.reps,
      date: previousRecord.date,
    } : undefined,
    createdAt: now,
  };
  
  const docRef = await addDoc(collection(db, RECORDS_COLLECTION), recordData);
  return docRef.id;
}

/**
 * Get current record for an exercise
 */
export async function getExerciseRecord(
  clientId: string,
  exerciseId: string
): Promise<PersonalRecord | null> {
  try {
    const recordsQuery = query(
      collection(db, RECORDS_COLLECTION),
      where('clientId', '==', clientId),
      where('exerciseId', '==', exerciseId),
      orderBy('date', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(recordsQuery);
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as PersonalRecord;
  } catch (error) {
    console.error('Error getting exercise record:', error);
    return null;
  }
}

/**
 * Get all personal records for client
 */
export async function getClientPersonalRecords(
  clientId: string,
  limitCount: number = 50
): Promise<PersonalRecord[]> {
  try {
    const recordsQuery = query(
      collection(db, RECORDS_COLLECTION),
      where('clientId', '==', clientId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(recordsQuery);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PersonalRecord));
  } catch (error) {
    console.error('Error getting personal records:', error);
    return [];
  }
}

/**
 * Get latest records (most recent PR for each exercise)
 */
export async function getLatestRecords(clientId: string): Promise<PersonalRecord[]> {
  const allRecords = await getClientPersonalRecords(clientId, 100);
  
  // Group by exercise and get latest
  const latestByExercise = new Map<string, PersonalRecord>();
  
  allRecords.forEach(record => {
    const existing = latestByExercise.get(record.exerciseId);
    if (!existing || record.date > existing.date) {
      latestByExercise.set(record.exerciseId, record);
    }
  });
  
  return Array.from(latestByExercise.values()).sort((a, b) => 
    b.date.localeCompare(a.date)
  );
}

/**
 * Delete personal record
 */
export async function deletePersonalRecord(recordId: string): Promise<void> {
  const docRef = doc(db, RECORDS_COLLECTION, recordId);
  await deleteDoc(docRef);
}

// ============================================================================
// Summary & Helpers
// ============================================================================

/**
 * Get body summary for client
 */
export async function getBodySummary(clientId: string): Promise<BodySummary> {
  const latestMetric = await getLatestBodyMetric(clientId);
  const weightHistory = await getWeightHistory(clientId, 7);
  const records = await getLatestRecords(clientId);
  
  let weightChange: number | undefined;
  if (weightHistory.length >= 2) {
    const latest = weightHistory[weightHistory.length - 1].weight;
    const previous = weightHistory[0].weight;
    weightChange = Math.round((latest - previous) * 10) / 10;
  }
  
  return {
    currentWeight: latestMetric?.weight,
    weightChange,
    latestMeasurements: latestMetric?.measurements,
    measurementsDate: latestMetric?.date,
    personalRecordsCount: records.length,
    latestRecord: records[0],
  };
}

/**
 * Format weight for display
 */
export function formatWeight(weight?: number): string {
  if (!weight) return '—';
  return `${weight} кг`;
}

/**
 * Format measurement for display
 */
export function formatMeasurement(value?: number): string {
  if (!value) return '—';
  return `${value} см`;
}

/**
 * Format weight change with + or -
 */
export function formatWeightChange(change?: number): string {
  if (!change) return '—';
  const sign = change > 0 ? '+' : '';
  return `${sign}${change} кг`;
}

/**
 * Get weight change color class
 */
export function getWeightChangeColor(change?: number, isGoalLoss: boolean = true): string {
  if (!change) return 'text-gray-500';
  
  if (isGoalLoss) {
    // Losing weight is good
    return change < 0 ? 'text-green-500' : 'text-red-500';
  } else {
    // Gaining weight is good
    return change > 0 ? 'text-green-500' : 'text-red-500';
  }
}

/**
 * Check if this is a new personal record
 */
export function isNewRecord(current: { weight: number; reps: number }, previous?: { weight: number; reps: number }): boolean {
  if (!previous) return true;
  
  // Either more weight at same reps, or same weight with more reps
  const currentScore = current.weight * (1 + current.reps * 0.03);
  const previousScore = previous.weight * (1 + previous.reps * 0.03);
  
  return currentScore > previousScore;
}

// ============================================================================
// Aliases for Trainer OS v2 Pages
// ============================================================================

/**
 * Get client measurements - alias for getBodyMetricsHistory
 */
export async function getClientMeasurements(
  clientId: string,
  limitCount: number = 10
): Promise<BodyMetric[]> {
  return getBodyMetricsHistory(clientId, limitCount);
}
