/**
 * Watch Metrics Service - Trainer OS
 * 
 * Manages health data from wearables:
 * - Heart rate, calories, steps
 * - Apple Health / Google Fit integration (v1 foundation)
 * 
 * Client sees brief numbers, Coach sees trends.
 * 
 * @module services/watchService
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
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ============================================================================
// Types
// ============================================================================

export type MetricSource = 'apple_health' | 'google_fit' | 'manual' | 'workout';

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
  date: string; // YYYY-MM-DD
  source: MetricSource;
  heartRate?: HeartRateData;
  calories?: CaloriesData;
  steps?: number;
  activeMinutes?: number;
  sleepHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailyMetricsSummary {
  date: string;
  heartRateAvg?: number;
  heartRateMax?: number;
  caloriesTotal?: number;
  caloriesActive?: number;
  steps?: number;
  activeMinutes?: number;
  sleepHours?: number;
}

export interface WeeklyMetricsTrend {
  weekStartDate: string;
  avgHeartRate: number;
  avgCalories: number;
  totalSteps: number;
  avgActiveMinutes: number;
  avgSleepHours: number;
  anomalies: MetricAnomaly[];
}

export interface MetricAnomaly {
  type: 'high_heart_rate' | 'low_activity' | 'poor_sleep';
  date: string;
  value: number;
  message: string;
}

// ============================================================================
// Constants
// ============================================================================

const METRICS_COLLECTION = 'watchMetrics';

// Thresholds for anomaly detection
const HIGH_HEART_RATE = 100; // resting
const LOW_STEPS_THRESHOLD = 2000;
const POOR_SLEEP_THRESHOLD = 5; // hours

// ============================================================================
// Save Metrics
// ============================================================================

/**
 * Save metrics from workout session
 */
export async function saveWorkoutMetrics(
  clientId: string,
  heartRateAvg: number,
  heartRateMax: number,
  caloriesBurned: number
): Promise<string> {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();
  
  const metricData: Omit<WatchMetric, 'id'> = {
    clientId,
    date: today,
    source: 'workout',
    heartRate: {
      avg: heartRateAvg,
      max: heartRateMax,
      min: heartRateAvg - 20, // Estimate
    },
    calories: {
      active: caloriesBurned,
      total: caloriesBurned,
    },
    createdAt: now,
    updatedAt: now,
  };
  
  const docRef = await addDoc(collection(db, METRICS_COLLECTION), metricData);
  return docRef.id;
}

/**
 * Save manual metrics entry
 */
export async function saveManualMetrics(
  clientId: string,
  data: {
    heartRate?: HeartRateData;
    calories?: CaloriesData;
    steps?: number;
    activeMinutes?: number;
    sleepHours?: number;
  },
  date?: string
): Promise<string> {
  const metricDate = date || new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();
  
  const metricData: Omit<WatchMetric, 'id'> = {
    clientId,
    date: metricDate,
    source: 'manual',
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  
  const docRef = await addDoc(collection(db, METRICS_COLLECTION), metricData);
  return docRef.id;
}

/**
 * Save Apple Health data (v1 foundation - to be integrated with native app)
 */
export async function saveAppleHealthMetrics(
  clientId: string,
  date: string,
  data: {
    heartRate?: HeartRateData;
    calories?: CaloriesData;
    steps?: number;
    activeMinutes?: number;
    sleepHours?: number;
  }
): Promise<string> {
  const now = new Date().toISOString();
  
  const metricData: Omit<WatchMetric, 'id'> = {
    clientId,
    date,
    source: 'apple_health',
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  
  const docRef = await addDoc(collection(db, METRICS_COLLECTION), metricData);
  return docRef.id;
}

// ============================================================================
// Read Metrics
// ============================================================================

/**
 * Get today's metrics for client (brief view)
 */
export async function getTodayMetrics(clientId: string): Promise<DailyMetricsSummary | null> {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const metricsQuery = query(
      collection(db, METRICS_COLLECTION),
      where('clientId', '==', clientId),
      where('date', '==', today),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    
    const snapshot = await getDocs(metricsQuery);
    
    if (snapshot.empty) return null;
    
    // Aggregate all metrics for today
    const metrics = snapshot.docs.map(d => d.data() as WatchMetric);
    return aggregateDailyMetrics(today, metrics);
  } catch (error) {
    console.error('Error getting today metrics:', error);
    return null;
  }
}

/**
 * Get metrics for a date range
 */
export async function getMetricsRange(
  clientId: string,
  startDate: string,
  endDate: string
): Promise<DailyMetricsSummary[]> {
  try {
    const metricsQuery = query(
      collection(db, METRICS_COLLECTION),
      where('clientId', '==', clientId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc')
    );
    
    const snapshot = await getDocs(metricsQuery);
    
    // Group by date
    const byDate = new Map<string, WatchMetric[]>();
    snapshot.docs.forEach(d => {
      const metric = d.data() as WatchMetric;
      const existing = byDate.get(metric.date) || [];
      existing.push(metric);
      byDate.set(metric.date, existing);
    });
    
    // Aggregate each day
    const summaries: DailyMetricsSummary[] = [];
    byDate.forEach((metrics, date) => {
      summaries.push(aggregateDailyMetrics(date, metrics));
    });
    
    return summaries;
  } catch (error) {
    console.error('Error getting metrics range:', error);
    return [];
  }
}

/**
 * Get weekly trend for coach view
 */
export async function getWeeklyTrend(
  clientId: string,
  weekStartDate: string
): Promise<WeeklyMetricsTrend> {
  const weekStart = new Date(weekStartDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  const dailySummaries = await getMetricsRange(
    clientId,
    weekStartDate,
    weekEnd.toISOString().split('T')[0]
  );
  
  // Calculate averages
  let totalHeartRate = 0;
  let heartRateCount = 0;
  let totalCalories = 0;
  let caloriesCount = 0;
  let totalSteps = 0;
  let totalActiveMinutes = 0;
  let activeMinutesCount = 0;
  let totalSleepHours = 0;
  let sleepCount = 0;
  
  const anomalies: MetricAnomaly[] = [];
  
  dailySummaries.forEach(summary => {
    if (summary.heartRateAvg) {
      totalHeartRate += summary.heartRateAvg;
      heartRateCount++;
      
      // Check for high resting heart rate anomaly
      if (summary.heartRateAvg > HIGH_HEART_RATE) {
        anomalies.push({
          type: 'high_heart_rate',
          date: summary.date,
          value: summary.heartRateAvg,
          message: `Высокий средний пульс: ${summary.heartRateAvg} уд/мин`,
        });
      }
    }
    
    if (summary.caloriesTotal) {
      totalCalories += summary.caloriesTotal;
      caloriesCount++;
    }
    
    if (summary.steps) {
      totalSteps += summary.steps;
      
      // Check for low activity
      if (summary.steps < LOW_STEPS_THRESHOLD) {
        anomalies.push({
          type: 'low_activity',
          date: summary.date,
          value: summary.steps,
          message: `Низкая активность: ${summary.steps} шагов`,
        });
      }
    }
    
    if (summary.activeMinutes) {
      totalActiveMinutes += summary.activeMinutes;
      activeMinutesCount++;
    }
    
    if (summary.sleepHours) {
      totalSleepHours += summary.sleepHours;
      sleepCount++;
      
      // Check for poor sleep
      if (summary.sleepHours < POOR_SLEEP_THRESHOLD) {
        anomalies.push({
          type: 'poor_sleep',
          date: summary.date,
          value: summary.sleepHours,
          message: `Недостаточный сон: ${summary.sleepHours}ч`,
        });
      }
    }
  });
  
  return {
    weekStartDate,
    avgHeartRate: heartRateCount > 0 ? Math.round(totalHeartRate / heartRateCount) : 0,
    avgCalories: caloriesCount > 0 ? Math.round(totalCalories / caloriesCount) : 0,
    totalSteps,
    avgActiveMinutes: activeMinutesCount > 0 ? Math.round(totalActiveMinutes / activeMinutesCount) : 0,
    avgSleepHours: sleepCount > 0 ? Math.round(totalSleepHours / sleepCount * 10) / 10 : 0,
    anomalies,
  };
}

/**
 * Get last 7 days metrics for client
 */
export async function getRecentMetrics(clientId: string): Promise<DailyMetricsSummary[]> {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  return getMetricsRange(
    clientId,
    weekAgo.toISOString().split('T')[0],
    today.toISOString().split('T')[0]
  );
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Aggregate multiple metrics for a single day
 */
function aggregateDailyMetrics(date: string, metrics: WatchMetric[]): DailyMetricsSummary {
  let heartRateSum = 0;
  let heartRateCount = 0;
  let heartRateMax = 0;
  let caloriesTotal = 0;
  let caloriesActive = 0;
  let steps = 0;
  let activeMinutes = 0;
  let sleepHours = 0;
  
  metrics.forEach(m => {
    if (m.heartRate) {
      heartRateSum += m.heartRate.avg;
      heartRateCount++;
      heartRateMax = Math.max(heartRateMax, m.heartRate.max);
    }
    
    if (m.calories) {
      caloriesTotal = Math.max(caloriesTotal, m.calories.total);
      caloriesActive = Math.max(caloriesActive, m.calories.active);
    }
    
    if (m.steps) {
      steps = Math.max(steps, m.steps);
    }
    
    if (m.activeMinutes) {
      activeMinutes = Math.max(activeMinutes, m.activeMinutes);
    }
    
    if (m.sleepHours) {
      sleepHours = Math.max(sleepHours, m.sleepHours);
    }
  });
  
  return {
    date,
    heartRateAvg: heartRateCount > 0 ? Math.round(heartRateSum / heartRateCount) : undefined,
    heartRateMax: heartRateMax > 0 ? heartRateMax : undefined,
    caloriesTotal: caloriesTotal > 0 ? caloriesTotal : undefined,
    caloriesActive: caloriesActive > 0 ? caloriesActive : undefined,
    steps: steps > 0 ? steps : undefined,
    activeMinutes: activeMinutes > 0 ? activeMinutes : undefined,
    sleepHours: sleepHours > 0 ? sleepHours : undefined,
  };
}

/**
 * Format heart rate for display
 */
export function formatHeartRate(hr?: number): string {
  if (!hr) return '—';
  return `${hr} уд/мин`;
}

/**
 * Format calories for display
 */
export function formatCalories(cal?: number): string {
  if (!cal) return '—';
  return `${cal} ккал`;
}

/**
 * Format steps for display
 */
export function formatSteps(steps?: number): string {
  if (!steps) return '—';
  return steps.toLocaleString();
}

/**
 * Check if Apple Health is available (for native integration)
 */
export function isAppleHealthAvailable(): boolean {
  // Will be implemented in native app wrapper
  // For web, return false
  return false;
}

/**
 * Request Apple Health permissions (placeholder for native)
 */
export async function requestAppleHealthPermissions(): Promise<boolean> {
  // Will be implemented in native app wrapper
  return false;
}
