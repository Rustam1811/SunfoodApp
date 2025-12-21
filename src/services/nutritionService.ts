/**
 * Nutrition Service - Trainer OS
 * 
 * Manages nutrition plans, meal checkmarks, and water tracking.
 * Client sees minimal numbers - just checkboxes.
 * Coach sees full macros.
 * 
 * @module services/nutritionService
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
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ============================================================================
// Types
// ============================================================================

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  name: string;
  description?: string;
  ingredients?: string[];
  macros?: Macros;
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
  weekStartDate: string; // ISO date
  days: Record<DayOfWeek, DayMeals>;
  macros: Macros; // Daily target
  createdAt: string;
  updatedAt: string;
}

export interface NutritionCheckmark {
  id: string;
  clientId: string;
  date: string; // YYYY-MM-DD
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  waterGlasses: number; // 0-12
  snacks: boolean[];
  updatedAt: string;
}

export interface TodayNutrition {
  plan: DayMeals | null;
  checkmarks: NutritionCheckmark;
  macros?: Macros;
}

// ============================================================================
// Constants
// ============================================================================

const PLANS_COLLECTION = 'nutritionPlans';
const CHECKMARKS_COLLECTION = 'nutritionCheckmarks';

const DAYS_ORDER: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// ============================================================================
// Helper Functions
// ============================================================================

function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

function getDayOfWeek(date: Date = new Date()): DayOfWeek {
  const day = date.getDay();
  // JS: 0 = Sunday, 1 = Monday, etc.
  const dayMap: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return dayMap[day];
}

function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  return new Date(d.setDate(diff));
}

function getCheckmarkId(clientId: string, date: string): string {
  return `${date}_${clientId}`;
}

// ============================================================================
// Nutrition Plans
// ============================================================================

/**
 * Get current week's nutrition plan for a client
 */
export async function getCurrentNutritionPlan(clientId: string): Promise<NutritionPlan | null> {
  const weekStart = getWeekStart();
  const weekStartStr = getDateString(weekStart);
  
  try {
    const plansQuery = query(
      collection(db, PLANS_COLLECTION),
      where('clientId', '==', clientId),
      where('weekStartDate', '==', weekStartStr)
    );
    
    const snapshot = await getDocs(plansQuery);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as NutritionPlan;
  } catch (error) {
    console.error('Error getting nutrition plan:', error);
    return null;
  }
}

/**
 * Get nutrition plan by week start date
 */
export async function getNutritionPlanByWeek(
  clientId: string, 
  weekStartDate: string
): Promise<NutritionPlan | null> {
  try {
    const plansQuery = query(
      collection(db, PLANS_COLLECTION),
      where('clientId', '==', clientId),
      where('weekStartDate', '==', weekStartDate)
    );
    
    const snapshot = await getDocs(plansQuery);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as NutritionPlan;
  } catch (error) {
    console.error('Error getting nutrition plan:', error);
    return null;
  }
}

/**
 * Create or update nutrition plan
 */
export async function saveNutritionPlan(
  coachId: string,
  clientId: string,
  weekStartDate: string,
  days: Record<DayOfWeek, DayMeals>,
  macros: Macros
): Promise<string> {
  const planId = `plan_${clientId}_${weekStartDate}`;
  const now = new Date().toISOString();
  
  const planData = {
    clientId,
    coachId,
    weekStartDate,
    days,
    macros,
    updatedAt: now,
  };
  
  const docRef = doc(db, PLANS_COLLECTION, planId);
  const existing = await getDoc(docRef);
  
  if (existing.exists()) {
    await updateDoc(docRef, planData);
  } else {
    await setDoc(docRef, {
      ...planData,
      createdAt: now,
    });
  }
  
  return planId;
}

/**
 * Get all nutrition plans for a client
 */
export async function getClientNutritionPlans(clientId: string): Promise<NutritionPlan[]> {
  try {
    const plansQuery = query(
      collection(db, PLANS_COLLECTION),
      where('clientId', '==', clientId),
      orderBy('weekStartDate', 'desc')
    );
    
    const snapshot = await getDocs(plansQuery);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as NutritionPlan));
  } catch (error) {
    console.error('Error getting client nutrition plans:', error);
    return [];
  }
}

// ============================================================================
// Nutrition Checkmarks
// ============================================================================

/**
 * Get today's checkmarks for a client
 */
export async function getTodayCheckmarks(clientId: string): Promise<NutritionCheckmark> {
  const today = getDateString();
  const checkmarkId = getCheckmarkId(clientId, today);
  
  try {
    const docRef = doc(db, CHECKMARKS_COLLECTION, checkmarkId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as NutritionCheckmark;
    }
    
    // Return default empty checkmarks
    return {
      id: checkmarkId,
      clientId,
      date: today,
      breakfast: false,
      lunch: false,
      dinner: false,
      waterGlasses: 0,
      snacks: [],
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting checkmarks:', error);
    return {
      id: checkmarkId,
      clientId,
      date: today,
      breakfast: false,
      lunch: false,
      dinner: false,
      waterGlasses: 0,
      snacks: [],
      updatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Subscribe to today's checkmarks (real-time)
 */
export function subscribeTodayCheckmarks(
  clientId: string,
  callback: (checkmarks: NutritionCheckmark) => void
): () => void {
  const today = getDateString();
  const checkmarkId = getCheckmarkId(clientId, today);
  const docRef = doc(db, CHECKMARKS_COLLECTION, checkmarkId);
  
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as NutritionCheckmark);
    } else {
      callback({
        id: checkmarkId,
        clientId,
        date: today,
        breakfast: false,
        lunch: false,
        dinner: false,
        waterGlasses: 0,
        snacks: [],
        updatedAt: new Date().toISOString(),
      });
    }
  });
}

/**
 * Toggle meal checkmark
 */
export async function toggleMealCheckmark(
  clientId: string,
  meal: 'breakfast' | 'lunch' | 'dinner',
  checked: boolean
): Promise<void> {
  const today = getDateString();
  const checkmarkId = getCheckmarkId(clientId, today);
  const docRef = doc(db, CHECKMARKS_COLLECTION, checkmarkId);
  
  try {
    const docSnap = await getDoc(docRef);
    const now = new Date().toISOString();
    
    if (docSnap.exists()) {
      await updateDoc(docRef, {
        [meal]: checked,
        updatedAt: now,
      });
    } else {
      await setDoc(docRef, {
        clientId,
        date: today,
        breakfast: meal === 'breakfast' ? checked : false,
        lunch: meal === 'lunch' ? checked : false,
        dinner: meal === 'dinner' ? checked : false,
        waterGlasses: 0,
        snacks: [],
        updatedAt: now,
      });
    }
  } catch (error) {
    console.error('Error toggling meal checkmark:', error);
    throw error;
  }
}

/**
 * Add water glass
 */
export async function addWaterGlass(clientId: string): Promise<number> {
  const today = getDateString();
  const checkmarkId = getCheckmarkId(clientId, today);
  const docRef = doc(db, CHECKMARKS_COLLECTION, checkmarkId);
  
  try {
    const docSnap = await getDoc(docRef);
    const now = new Date().toISOString();
    
    let newCount = 1;
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      newCount = Math.min((data.waterGlasses || 0) + 1, 12);
      await updateDoc(docRef, {
        waterGlasses: newCount,
        updatedAt: now,
      });
    } else {
      await setDoc(docRef, {
        clientId,
        date: today,
        breakfast: false,
        lunch: false,
        dinner: false,
        waterGlasses: 1,
        snacks: [],
        updatedAt: now,
      });
    }
    
    return newCount;
  } catch (error) {
    console.error('Error adding water glass:', error);
    throw error;
  }
}

/**
 * Set water count directly
 */
export async function setWaterCount(clientId: string, count: number): Promise<void> {
  const today = getDateString();
  const checkmarkId = getCheckmarkId(clientId, today);
  const docRef = doc(db, CHECKMARKS_COLLECTION, checkmarkId);
  
  const validCount = Math.max(0, Math.min(count, 12));
  
  try {
    const docSnap = await getDoc(docRef);
    const now = new Date().toISOString();
    
    if (docSnap.exists()) {
      await updateDoc(docRef, {
        waterGlasses: validCount,
        updatedAt: now,
      });
    } else {
      await setDoc(docRef, {
        clientId,
        date: today,
        breakfast: false,
        lunch: false,
        dinner: false,
        waterGlasses: validCount,
        snacks: [],
        updatedAt: now,
      });
    }
  } catch (error) {
    console.error('Error setting water count:', error);
    throw error;
  }
}

// ============================================================================
// Weekly Data for Coach
// ============================================================================

/**
 * Get week's checkmarks for a client
 */
export async function getWeekCheckmarks(
  clientId: string,
  weekStartDate: Date = getWeekStart()
): Promise<Map<DayOfWeek, NutritionCheckmark>> {
  const result = new Map<DayOfWeek, NutritionCheckmark>();
  
  try {
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStartDate);
      date.setDate(date.getDate() + i);
      const dateStr = getDateString(date);
      const dayOfWeek = DAYS_ORDER[i];
      
      const checkmarkId = getCheckmarkId(clientId, dateStr);
      const docRef = doc(db, CHECKMARKS_COLLECTION, checkmarkId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        result.set(dayOfWeek, { id: docSnap.id, ...docSnap.data() } as NutritionCheckmark);
      } else {
        result.set(dayOfWeek, {
          id: checkmarkId,
          clientId,
          date: dateStr,
          breakfast: false,
          lunch: false,
          dinner: false,
          waterGlasses: 0,
          snacks: [],
          updatedAt: '',
        });
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error getting week checkmarks:', error);
    return result;
  }
}

/**
 * Calculate nutrition adherence for a week
 */
export async function getWeeklyNutritionAdherence(
  clientId: string,
  weekStartDate: Date = getWeekStart()
): Promise<{
  totalMeals: number;
  completedMeals: number;
  adherencePercent: number;
  avgWaterGlasses: number;
}> {
  const checkmarks = await getWeekCheckmarks(clientId, weekStartDate);
  
  let totalMeals = 0;
  let completedMeals = 0;
  let totalWater = 0;
  let daysWithData = 0;
  
  checkmarks.forEach((checkmark) => {
    totalMeals += 3; // breakfast, lunch, dinner
    if (checkmark.breakfast) completedMeals++;
    if (checkmark.lunch) completedMeals++;
    if (checkmark.dinner) completedMeals++;
    
    if (checkmark.waterGlasses > 0) {
      totalWater += checkmark.waterGlasses;
      daysWithData++;
    }
  });
  
  return {
    totalMeals,
    completedMeals,
    adherencePercent: totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0,
    avgWaterGlasses: daysWithData > 0 ? Math.round(totalWater / daysWithData) : 0,
  };
}

// ============================================================================
// Today's Full Data
// ============================================================================

/**
 * Get complete today nutrition data for client view
 */
export async function getTodayNutrition(clientId: string, showMacros: boolean = false): Promise<TodayNutrition> {
  const plan = await getCurrentNutritionPlan(clientId);
  const checkmarks = await getTodayCheckmarks(clientId);
  
  const dayOfWeek = getDayOfWeek();
  const todayMeals = plan?.days[dayOfWeek] || null;
  
  return {
    plan: todayMeals,
    checkmarks,
    macros: showMacros ? plan?.macros : undefined,
  };
}

/**
 * Subscribe to today's nutrition (real-time)
 */
export function subscribeTodayNutrition(
  clientId: string,
  showMacros: boolean,
  callback: (data: TodayNutrition) => void
): () => void {
  // First load the plan (doesn't need real-time)
  let currentPlan: NutritionPlan | null = null;
  
  getCurrentNutritionPlan(clientId).then(plan => {
    currentPlan = plan;
    // Trigger initial callback with current checkmarks
  });
  
  // Subscribe to checkmarks (real-time)
  return subscribeTodayCheckmarks(clientId, (checkmarks) => {
    const dayOfWeek = getDayOfWeek();
    const todayMeals = currentPlan?.days[dayOfWeek] || null;
    
    callback({
      plan: todayMeals,
      checkmarks,
      macros: showMacros ? currentPlan?.macros : undefined,
    });
  });
}
