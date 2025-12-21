/**
 * Signals Service - Trainer OS
 * 
 * Smart logic for tracking client behavior:
 * - Skip 2 days => coach gets signal
 * - High heart rate => recommendation
 * - Weekly summary: green/yellow/red
 * 
 * @module services/signalsService
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ============================================================================
// Types
// ============================================================================

export type SignalType = 'skip_workout' | 'high_heart_rate' | 'low_adherence' | 'no_login' | 'streak_broken';
export type SignalSeverity = 'info' | 'warning' | 'alert';
export type SummaryStatus = 'green' | 'yellow' | 'red';

export interface Signal {
  id: string;
  clientId: string;
  clientName?: string;
  coachId: string;
  type: SignalType;
  severity: SignalSeverity;
  message: string;
  data?: Record<string, unknown>;
  acknowledged: boolean;
  acknowledgedAt?: string;
  createdAt: string;
}

export interface WeeklySummary {
  id: string;
  clientId: string;
  clientName?: string;
  coachId: string;
  weekStartDate: string; // YYYY-MM-DD
  status: SummaryStatus;
  workoutsPlanned: number;
  workoutsCompleted: number;
  nutritionAdherence: number; // %
  waterAverage: number;
  signals: string[]; // signal IDs
  notes?: string;
  createdAt: string;
}

// ============================================================================
// Constants
// ============================================================================

const SIGNALS_COLLECTION = 'signals';
const SUMMARIES_COLLECTION = 'weeklySummaries';

// Signal thresholds
const SKIP_DAYS_THRESHOLD = 2;
const HIGH_HEART_RATE_THRESHOLD = 180;
const LOW_ADHERENCE_THRESHOLD = 50; // %
const NO_LOGIN_DAYS_THRESHOLD = 3;

// ============================================================================
// Create Signals
// ============================================================================

/**
 * Create a new signal
 */
export async function createSignal(
  clientId: string,
  coachId: string,
  type: SignalType,
  severity: SignalSeverity,
  message: string,
  data?: Record<string, unknown>,
  clientName?: string
): Promise<string> {
  const signalData = {
    clientId,
    clientName,
    coachId,
    type,
    severity,
    message,
    data,
    acknowledged: false,
    createdAt: new Date().toISOString(),
  };
  
  const docRef = await addDoc(collection(db, SIGNALS_COLLECTION), signalData);
  return docRef.id;
}

/**
 * Create skip workout signal (called when client skips 2+ days)
 */
export async function createSkipWorkoutSignal(
  clientId: string,
  coachId: string,
  skipDays: number,
  clientName?: string
): Promise<string | null> {
  if (skipDays < SKIP_DAYS_THRESHOLD) return null;
  
  const severity: SignalSeverity = skipDays >= 3 ? 'alert' : 'warning';
  const message = `Пропущено ${skipDays} дней тренировок подряд`;
  
  return createSignal(clientId, coachId, 'skip_workout', severity, message, { skipDays }, clientName);
}

/**
 * Create high heart rate signal
 */
export async function createHighHeartRateSignal(
  clientId: string,
  coachId: string,
  heartRate: number,
  clientName?: string
): Promise<string | null> {
  if (heartRate < HIGH_HEART_RATE_THRESHOLD) return null;
  
  const severity: SignalSeverity = heartRate >= 200 ? 'alert' : 'warning';
  const message = `Высокий пульс: ${heartRate} уд/мин. Рекомендуется снизить нагрузку`;
  
  return createSignal(clientId, coachId, 'high_heart_rate', severity, message, { heartRate }, clientName);
}

/**
 * Create low adherence signal
 */
export async function createLowAdherenceSignal(
  clientId: string,
  coachId: string,
  adherencePercent: number,
  clientName?: string
): Promise<string | null> {
  if (adherencePercent >= LOW_ADHERENCE_THRESHOLD) return null;
  
  const severity: SignalSeverity = adherencePercent < 30 ? 'alert' : 'warning';
  const message = `Низкое соблюдение плана: ${adherencePercent}%`;
  
  return createSignal(clientId, coachId, 'low_adherence', severity, message, { adherencePercent }, clientName);
}

/**
 * Create no login signal
 */
export async function createNoLoginSignal(
  clientId: string,
  coachId: string,
  daysSinceLogin: number,
  clientName?: string
): Promise<string | null> {
  if (daysSinceLogin < NO_LOGIN_DAYS_THRESHOLD) return null;
  
  const severity: SignalSeverity = daysSinceLogin >= 7 ? 'alert' : 'warning';
  const message = `Не заходил в приложение ${daysSinceLogin} дней`;
  
  return createSignal(clientId, coachId, 'no_login', severity, message, { daysSinceLogin }, clientName);
}

// ============================================================================
// Read Signals
// ============================================================================

/**
 * Get unacknowledged signals for a coach
 */
export async function getActiveSignals(coachId: string): Promise<Signal[]> {
  try {
    const signalsQuery = query(
      collection(db, SIGNALS_COLLECTION),
      where('coachId', '==', coachId),
      where('acknowledged', '==', false),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const snapshot = await getDocs(signalsQuery);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Signal));
  } catch (error) {
    console.error('Error getting signals:', error);
    return [];
  }
}

/**
 * Subscribe to active signals (real-time)
 */
export function subscribeActiveSignals(
  coachId: string,
  callback: (signals: Signal[]) => void
): () => void {
  const signalsQuery = query(
    collection(db, SIGNALS_COLLECTION),
    where('coachId', '==', coachId),
    where('acknowledged', '==', false),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(signalsQuery, (snapshot) => {
    const signals = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Signal));
    callback(signals);
  });
}

/**
 * Get signals for a specific client
 */
export async function getClientSignals(
  clientId: string,
  limitCount: number = 20
): Promise<Signal[]> {
  try {
    const signalsQuery = query(
      collection(db, SIGNALS_COLLECTION),
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(signalsQuery);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Signal));
  } catch (error) {
    console.error('Error getting client signals:', error);
    return [];
  }
}

/**
 * Acknowledge a signal
 */
export async function acknowledgeSignal(signalId: string): Promise<void> {
  const docRef = doc(db, SIGNALS_COLLECTION, signalId);
  await updateDoc(docRef, {
    acknowledged: true,
    acknowledgedAt: new Date().toISOString(),
  });
}

/**
 * Acknowledge all signals for a client
 */
export async function acknowledgeAllClientSignals(
  clientId: string,
  coachId: string
): Promise<void> {
  const signalsQuery = query(
    collection(db, SIGNALS_COLLECTION),
    where('clientId', '==', clientId),
    where('coachId', '==', coachId),
    where('acknowledged', '==', false)
  );
  
  const snapshot = await getDocs(signalsQuery);
  const now = new Date().toISOString();
  
  for (const signalDoc of snapshot.docs) {
    await updateDoc(signalDoc.ref, {
      acknowledged: true,
      acknowledgedAt: now,
    });
  }
}

// ============================================================================
// Weekly Summaries
// ============================================================================

/**
 * Create or update weekly summary
 */
export async function saveWeeklySummary(
  clientId: string,
  coachId: string,
  weekStartDate: string,
  data: {
    workoutsPlanned: number;
    workoutsCompleted: number;
    nutritionAdherence: number;
    waterAverage: number;
    signals: string[];
    clientName?: string;
    notes?: string;
  }
): Promise<string> {
  const summaryId = `summary_${clientId}_${weekStartDate}`;
  
  // Calculate status
  const workoutAdherence = data.workoutsPlanned > 0 
    ? (data.workoutsCompleted / data.workoutsPlanned) * 100 
    : 100;
  
  let status: SummaryStatus;
  if (workoutAdherence >= 80 && data.nutritionAdherence >= 70) {
    status = 'green';
  } else if (workoutAdherence >= 50 || data.nutritionAdherence >= 50) {
    status = 'yellow';
  } else {
    status = 'red';
  }
  
  // Downgrade to red if there are alert signals
  if (data.signals.length > 0) {
    const alertSignals = await getSignalsByIds(data.signals);
    const hasAlert = alertSignals.some(s => s.severity === 'alert');
    if (hasAlert) {
      status = 'red';
    } else if (alertSignals.some(s => s.severity === 'warning') && status === 'green') {
      status = 'yellow';
    }
  }
  
  const summaryData: Omit<WeeklySummary, 'id'> = {
    clientId,
    clientName: data.clientName,
    coachId,
    weekStartDate,
    status,
    workoutsPlanned: data.workoutsPlanned,
    workoutsCompleted: data.workoutsCompleted,
    nutritionAdherence: data.nutritionAdherence,
    waterAverage: data.waterAverage,
    signals: data.signals,
    notes: data.notes,
    createdAt: new Date().toISOString(),
  };
  
  const docRef = doc(db, SUMMARIES_COLLECTION, summaryId);
  const existing = await getDoc(docRef);
  
  if (existing.exists()) {
    await updateDoc(docRef, summaryData);
  } else {
    await updateDoc(docRef, summaryData).catch(() => {
      // Document doesn't exist, create it
      return addDoc(collection(db, SUMMARIES_COLLECTION), {
        ...summaryData,
        id: summaryId,
      });
    });
  }
  
  return summaryId;
}

/**
 * Get weekly summaries for coach's clients
 */
export async function getCoachWeeklySummaries(
  coachId: string,
  weekStartDate: string
): Promise<WeeklySummary[]> {
  try {
    const summariesQuery = query(
      collection(db, SUMMARIES_COLLECTION),
      where('coachId', '==', coachId),
      where('weekStartDate', '==', weekStartDate)
    );
    
    const snapshot = await getDocs(summariesQuery);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as WeeklySummary));
  } catch (error) {
    console.error('Error getting summaries:', error);
    return [];
  }
}

/**
 * Get client's weekly summaries history
 */
export async function getClientWeeklySummaries(
  clientId: string,
  limitCount: number = 12
): Promise<WeeklySummary[]> {
  try {
    const summariesQuery = query(
      collection(db, SUMMARIES_COLLECTION),
      where('clientId', '==', clientId),
      orderBy('weekStartDate', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(summariesQuery);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as WeeklySummary));
  } catch (error) {
    console.error('Error getting client summaries:', error);
    return [];
  }
}

/**
 * Subscribe to coach's current week summaries
 */
export function subscribeWeeklySummaries(
  coachId: string,
  weekStartDate: string,
  callback: (summaries: WeeklySummary[]) => void
): () => void {
  const summariesQuery = query(
    collection(db, SUMMARIES_COLLECTION),
    where('coachId', '==', coachId),
    where('weekStartDate', '==', weekStartDate)
  );
  
  return onSnapshot(summariesQuery, (snapshot) => {
    const summaries = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as WeeklySummary));
    callback(summaries);
  });
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Get signals by IDs
 */
async function getSignalsByIds(ids: string[]): Promise<Signal[]> {
  if (ids.length === 0) return [];
  
  const signals: Signal[] = [];
  for (const id of ids) {
    const docRef = doc(db, SIGNALS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      signals.push({ id: docSnap.id, ...docSnap.data() } as Signal);
    }
  }
  
  return signals;
}

/**
 * Get week start date (Monday)
 */
export function getWeekStartDate(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

/**
 * Get status color for display
 */
export function getStatusColor(status: SummaryStatus): string {
  switch (status) {
    case 'green': return 'bg-green-500';
    case 'yellow': return 'bg-yellow-500';
    case 'red': return 'bg-red-500';
  }
}

/**
 * Get severity color for display
 */
export function getSeverityColor(severity: SignalSeverity): string {
  switch (severity) {
    case 'info': return 'bg-blue-500';
    case 'warning': return 'bg-yellow-500';
    case 'alert': return 'bg-red-500';
  }
}

/**
 * Get signal type icon name
 */
export function getSignalIcon(type: SignalType): string {
  switch (type) {
    case 'skip_workout': return 'calendar-x';
    case 'high_heart_rate': return 'heart-pulse';
    case 'low_adherence': return 'trending-down';
    case 'no_login': return 'user-x';
    case 'streak_broken': return 'flame-off';
    default: return 'alert-circle';
  }
}

// ============================================================================
// Aliases for Trainer OS v2 Pages
// ============================================================================

/**
 * Get coach signals - alias for getActiveSignals with enriched data
 */
export async function getCoachSignals(coachId: string): Promise<Signal[]> {
  return getActiveSignals(coachId);
}

/**
 * Dismiss signal - alias for acknowledgeSignal
 */
export async function dismissSignal(signalId: string): Promise<void> {
  return acknowledgeSignal(signalId);
}
