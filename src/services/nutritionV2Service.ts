/**
 * Nutrition V2 Service - Enhanced Nutrition Tracking
 *
 * Features:
 * - Daily macro targets (coach-editable)
 * - Meal logging with photos
 * - Automatic kcal redistribution
 * - Water tracking with cup increments
 *
 * Path: tenants/{tenantId}/clients/{uid}/nutrition/{date}
 *
 * @module services/nutritionV2Service
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
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

export interface MacroTargets {
  kcal: number;
  protein: number; // grams
  fat: number; // grams
  carbs: number; // grams
}

export interface WaterTargets {
  dailyLiters: number;
  cupSizeMl: number; // default 250ml
}

export interface NutritionTargets {
  id: string;
  clientId: string;
  tenantId: string;
  macros: MacroTargets;
  water: WaterTargets;
  mealDistribution: MealDistribution;
  updatedAt: string;
  updatedBy: string; // coach ID
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealDistribution {
  breakfast: number; // percentage of daily kcal (e.g., 25)
  lunch: number; // 30
  dinner: number; // 30
  snack: number; // 15
}

export interface MealMacros {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface MealLogEntry {
  id: string;
  mealType: MealType;
  photoUrl?: string;
  photoThumbnail?: string;
  macros: MealMacros;
  notes?: string;
  loggedAt: string;
}

export interface DailyNutritionLog {
  id: string; // date string YYYY-MM-DD
  clientId: string;
  tenantId: string;
  date: string;
  meals: MealLogEntry[];
  waterCups: number;
  totalMacros: MealMacros;
  updatedAt: string;
}

export interface MealPlan {
  mealType: MealType;
  label: string;
  plannedKcal: number;
  adjustedKcal: number; // after redistribution
  isLogged: boolean;
  logEntry?: MealLogEntry;
}

export interface DailyNutritionState {
  date: string;
  targets: NutritionTargets;
  log: DailyNutritionLog | null;
  meals: MealPlan[];
  waterProgress: {
    current: number;
    target: number;
    cupsConsumed: number;
    cupsTarget: number;
    cupSizeMl: number;
  };
  macroProgress: {
    kcal: { current: number; target: number };
    protein: { current: number; target: number };
    fat: { current: number; target: number };
    carbs: { current: number; target: number };
  };
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TENANT = 'default';

const DEFAULT_MACROS: MacroTargets = {
  kcal: 2200,
  protein: 150,
  fat: 70,
  carbs: 220,
};

const DEFAULT_WATER: WaterTargets = {
  dailyLiters: 3,
  cupSizeMl: 250,
};

const DEFAULT_DISTRIBUTION: MealDistribution = {
  breakfast: 25,
  lunch: 30,
  dinner: 30,
  snack: 15,
};

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

// ============================================================================
// Targets Management
// ============================================================================

/**
 * Get nutrition targets for a client
 */
export async function getNutritionTargets(
  clientId: string,
  tenantId: string = DEFAULT_TENANT
): Promise<NutritionTargets> {
  try {
    const targetsRef = doc(
      db,
      'tenants',
      tenantId,
      'clients',
      clientId,
      'settings',
      'nutritionTargets'
    );
    const snap = await getDoc(targetsRef);

    if (snap.exists()) {
      return snap.data() as NutritionTargets;
    }

    // Return defaults if not set
    return {
      id: 'nutritionTargets',
      clientId,
      tenantId,
      macros: DEFAULT_MACROS,
      water: DEFAULT_WATER,
      mealDistribution: DEFAULT_DISTRIBUTION,
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
    };
  } catch {
    return {
      id: 'nutritionTargets',
      clientId,
      tenantId,
      macros: DEFAULT_MACROS,
      water: DEFAULT_WATER,
      mealDistribution: DEFAULT_DISTRIBUTION,
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
    };
  }
}

/**
 * Subscribe to nutrition targets
 */
export function subscribeToNutritionTargets(
  clientId: string,
  callback: (targets: NutritionTargets) => void,
  tenantId: string = DEFAULT_TENANT
): Unsubscribe {
  const targetsRef = doc(
    db,
    'tenants',
    tenantId,
    'clients',
    clientId,
    'settings',
    'nutritionTargets'
  );

  return onSnapshot(
    targetsRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as NutritionTargets);
      } else {
        callback({
          id: 'nutritionTargets',
          clientId,
          tenantId,
          macros: DEFAULT_MACROS,
          water: DEFAULT_WATER,
          mealDistribution: DEFAULT_DISTRIBUTION,
          updatedAt: new Date().toISOString(),
          updatedBy: 'system',
        });
      }
    },
    () => {
      callback({
        id: 'nutritionTargets',
        clientId,
        tenantId,
        macros: DEFAULT_MACROS,
        water: DEFAULT_WATER,
        mealDistribution: DEFAULT_DISTRIBUTION,
        updatedAt: new Date().toISOString(),
        updatedBy: 'system',
      });
    }
  );
}

/**
 * Update nutrition targets (coach only)
 */
export async function updateNutritionTargets(
  clientId: string,
  coachId: string,
  updates: Partial<Pick<NutritionTargets, 'macros' | 'water' | 'mealDistribution'>>,
  tenantId: string = DEFAULT_TENANT
): Promise<void> {
  const targetsRef = doc(
    db,
    'tenants',
    tenantId,
    'clients',
    clientId,
    'settings',
    'nutritionTargets'
  );

  const existing = await getDoc(targetsRef);
  const now = new Date().toISOString();

  if (existing.exists()) {
    await updateDoc(targetsRef, {
      ...updates,
      updatedAt: now,
      updatedBy: coachId,
    });
  } else {
    await setDoc(targetsRef, {
      id: 'nutritionTargets',
      clientId,
      tenantId,
      macros: updates.macros || DEFAULT_MACROS,
      water: updates.water || DEFAULT_WATER,
      mealDistribution: updates.mealDistribution || DEFAULT_DISTRIBUTION,
      updatedAt: now,
      updatedBy: coachId,
    });
  }
}

// ============================================================================
// Daily Log Management
// ============================================================================

/**
 * Get daily nutrition log
 */
export async function getDailyNutritionLog(
  clientId: string,
  date: string,
  tenantId: string = DEFAULT_TENANT
): Promise<DailyNutritionLog | null> {
  try {
    const logRef = doc(
      db,
      'tenants',
      tenantId,
      'clients',
      clientId,
      'nutrition',
      date
    );
    const snap = await getDoc(logRef);

    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as DailyNutritionLog;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Subscribe to daily nutrition log
 */
export function subscribeToDailyNutritionLog(
  clientId: string,
  date: string,
  callback: (log: DailyNutritionLog | null) => void,
  tenantId: string = DEFAULT_TENANT
): Unsubscribe {
  const logRef = doc(
    db,
    'tenants',
    tenantId,
    'clients',
    clientId,
    'nutrition',
    date
  );

  return onSnapshot(
    logRef,
    (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() } as DailyNutritionLog);
      } else {
        callback(null);
      }
    },
    () => {
      callback(null);
    }
  );
}

/**
 * Calculate total macros from meal entries
 */
function calculateTotalMacros(meals: MealLogEntry[]): MealMacros {
  return meals.reduce(
    (total, meal) => ({
      kcal: total.kcal + meal.macros.kcal,
      protein: total.protein + meal.macros.protein,
      fat: total.fat + meal.macros.fat,
      carbs: total.carbs + meal.macros.carbs,
    }),
    { kcal: 0, protein: 0, fat: 0, carbs: 0 }
  );
}

/**
 * Log a meal entry
 */
export async function logMealEntry(
  clientId: string,
  date: string,
  entry: Omit<MealLogEntry, 'id' | 'loggedAt'>,
  tenantId: string = DEFAULT_TENANT
): Promise<MealLogEntry> {
  const logRef = doc(
    db,
    'tenants',
    tenantId,
    'clients',
    clientId,
    'nutrition',
    date
  );

  const now = new Date().toISOString();
  const entryId = `${entry.mealType}-${Date.now()}`;

  const newEntry: MealLogEntry = {
    ...entry,
    id: entryId,
    loggedAt: now,
  };

  const existing = await getDoc(logRef);

  if (existing.exists()) {
    const data = existing.data() as DailyNutritionLog;
    const meals = [...data.meals, newEntry];
    const totalMacros = calculateTotalMacros(meals);

    await updateDoc(logRef, {
      meals,
      totalMacros,
      updatedAt: now,
    });
  } else {
    const newLog: Omit<DailyNutritionLog, 'id'> = {
      clientId,
      tenantId,
      date,
      meals: [newEntry],
      waterCups: 0,
      totalMacros: newEntry.macros,
      updatedAt: now,
    };

    await setDoc(logRef, newLog);
  }

  return newEntry;
}

/**
 * Update meal entry
 */
export async function updateMealEntry(
  clientId: string,
  date: string,
  entryId: string,
  updates: Partial<Pick<MealLogEntry, 'macros' | 'notes' | 'photoUrl' | 'photoThumbnail'>>,
  tenantId: string = DEFAULT_TENANT
): Promise<void> {
  const logRef = doc(
    db,
    'tenants',
    tenantId,
    'clients',
    clientId,
    'nutrition',
    date
  );

  const existing = await getDoc(logRef);
  if (!existing.exists()) return;

  const data = existing.data() as DailyNutritionLog;
  const meals = data.meals.map((m) =>
    m.id === entryId ? { ...m, ...updates } : m
  );
  const totalMacros = calculateTotalMacros(meals);

  await updateDoc(logRef, {
    meals,
    totalMacros,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete meal entry
 */
export async function deleteMealEntry(
  clientId: string,
  date: string,
  entryId: string,
  tenantId: string = DEFAULT_TENANT
): Promise<void> {
  const logRef = doc(
    db,
    'tenants',
    tenantId,
    'clients',
    clientId,
    'nutrition',
    date
  );

  const existing = await getDoc(logRef);
  if (!existing.exists()) return;

  const data = existing.data() as DailyNutritionLog;
  const meals = data.meals.filter((m) => m.id !== entryId);
  const totalMacros = calculateTotalMacros(meals);

  await updateDoc(logRef, {
    meals,
    totalMacros,
    updatedAt: new Date().toISOString(),
  });
}

// ============================================================================
// Water Tracking
// ============================================================================

/**
 * Add water cup
 */
export async function addWaterCup(
  clientId: string,
  date: string,
  tenantId: string = DEFAULT_TENANT
): Promise<number> {
  const logRef = doc(
    db,
    'tenants',
    tenantId,
    'clients',
    clientId,
    'nutrition',
    date
  );

  const existing = await getDoc(logRef);
  const now = new Date().toISOString();

  if (existing.exists()) {
    const data = existing.data() as DailyNutritionLog;
    const newCups = data.waterCups + 1;

    await updateDoc(logRef, {
      waterCups: newCups,
      updatedAt: now,
    });

    return newCups;
  } else {
    const newLog: Omit<DailyNutritionLog, 'id'> = {
      clientId,
      tenantId,
      date,
      meals: [],
      waterCups: 1,
      totalMacros: { kcal: 0, protein: 0, fat: 0, carbs: 0 },
      updatedAt: now,
    };

    await setDoc(logRef, newLog);
    return 1;
  }
}

/**
 * Remove water cup
 */
export async function removeWaterCup(
  clientId: string,
  date: string,
  tenantId: string = DEFAULT_TENANT
): Promise<number> {
  const logRef = doc(
    db,
    'tenants',
    tenantId,
    'clients',
    clientId,
    'nutrition',
    date
  );

  const existing = await getDoc(logRef);
  if (!existing.exists()) return 0;

  const data = existing.data() as DailyNutritionLog;
  const newCups = Math.max(0, data.waterCups - 1);

  await updateDoc(logRef, {
    waterCups: newCups,
    updatedAt: new Date().toISOString(),
  });

  return newCups;
}

/**
 * Set water cups directly
 */
export async function setWaterCups(
  clientId: string,
  date: string,
  cups: number,
  tenantId: string = DEFAULT_TENANT
): Promise<void> {
  const logRef = doc(
    db,
    'tenants',
    tenantId,
    'clients',
    clientId,
    'nutrition',
    date
  );

  const existing = await getDoc(logRef);
  const now = new Date().toISOString();

  if (existing.exists()) {
    await updateDoc(logRef, {
      waterCups: Math.max(0, cups),
      updatedAt: now,
    });
  } else {
    const newLog: Omit<DailyNutritionLog, 'id'> = {
      clientId,
      tenantId,
      date,
      meals: [],
      waterCups: Math.max(0, cups),
      totalMacros: { kcal: 0, protein: 0, fat: 0, carbs: 0 },
      updatedAt: now,
    };

    await setDoc(logRef, newLog);
  }
}

// ============================================================================
// Photo Upload
// ============================================================================

export interface PhotoUploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
}

export interface PhotoUploadResult {
  downloadUrl: string;
  storagePath: string;
}

/**
 * Upload meal photo
 */
export function uploadMealPhoto(
  clientId: string,
  mealType: MealType,
  file: File,
  tenantId: string = DEFAULT_TENANT,
  onProgress?: (progress: PhotoUploadProgress) => void
): { task: UploadTask; promise: Promise<PhotoUploadResult> } {
  const timestamp = Date.now();
  const extension = file.name.split('.').pop() || 'jpg';
  const storagePath = `tenants/${tenantId}/clients/${clientId}/meals/${mealType}_${timestamp}.${extension}`;

  const storageRef = ref(storage, storagePath);
  const task = uploadBytesResumable(storageRef, file);

  const promise = new Promise<PhotoUploadResult>((resolve, reject) => {
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
// Meal Redistribution Logic
// ============================================================================

/**
 * Calculate adjusted kcal for remaining meals
 * When a meal is logged with different kcal than planned,
 * redistribute the difference across remaining unlogged meals
 */
export function calculateAdjustedMealPlans(
  targets: NutritionTargets,
  loggedMeals: MealLogEntry[]
): MealPlan[] {
  const { macros, mealDistribution } = targets;
  const totalKcal = macros.kcal;

  // Calculate base planned kcal for each meal
  const basePlanned: Record<MealType, number> = {
    breakfast: Math.round((mealDistribution.breakfast / 100) * totalKcal),
    lunch: Math.round((mealDistribution.lunch / 100) * totalKcal),
    dinner: Math.round((mealDistribution.dinner / 100) * totalKcal),
    snack: Math.round((mealDistribution.snack / 100) * totalKcal),
  };

  // Map logged meals by type
  const loggedByType = new Map<MealType, MealLogEntry>();
  for (const entry of loggedMeals) {
    // Use most recent entry for each meal type
    loggedByType.set(entry.mealType, entry);
  }

  // Calculate consumed kcal
  let consumedKcal = 0;
  const loggedTypes = new Set<MealType>();

  for (const [type, entry] of loggedByType) {
    consumedKcal += entry.macros.kcal;
    loggedTypes.add(type);
  }

  // Calculate remaining kcal for unlogged meals
  const remainingKcal = totalKcal - consumedKcal;

  // Get unlogged meals and their weights
  const unloggedMeals = MEAL_ORDER.filter((type) => !loggedTypes.has(type));
  const totalUnloggedWeight = unloggedMeals.reduce(
    (sum, type) => sum + mealDistribution[type],
    0
  );

  // Build meal plans
  const mealPlans: MealPlan[] = MEAL_ORDER.map((mealType) => {
    const plannedKcal = basePlanned[mealType];
    const logEntry = loggedByType.get(mealType);
    const isLogged = !!logEntry;

    let adjustedKcal = plannedKcal;

    if (!isLogged && totalUnloggedWeight > 0) {
      // Redistribute remaining kcal proportionally
      const weight = mealDistribution[mealType];
      adjustedKcal = Math.round((weight / totalUnloggedWeight) * remainingKcal);
    } else if (isLogged) {
      adjustedKcal = logEntry.macros.kcal;
    }

    return {
      mealType,
      label: MEAL_LABELS[mealType],
      plannedKcal,
      adjustedKcal: Math.max(0, adjustedKcal),
      isLogged,
      logEntry,
    };
  });

  return mealPlans;
}

// ============================================================================
// Build Daily State
// ============================================================================

/**
 * Build complete daily nutrition state
 */
export function buildDailyNutritionState(
  date: string,
  targets: NutritionTargets,
  log: DailyNutritionLog | null
): DailyNutritionState {
  const meals = calculateAdjustedMealPlans(targets, log?.meals || []);
  const waterCups = log?.waterCups || 0;
  const cupsTarget = Math.ceil((targets.water.dailyLiters * 1000) / targets.water.cupSizeMl);
  const currentLiters = (waterCups * targets.water.cupSizeMl) / 1000;

  const totalMacros = log?.totalMacros || { kcal: 0, protein: 0, fat: 0, carbs: 0 };

  return {
    date,
    targets,
    log,
    meals,
    waterProgress: {
      current: currentLiters,
      target: targets.water.dailyLiters,
      cupsConsumed: waterCups,
      cupsTarget,
      cupSizeMl: targets.water.cupSizeMl,
    },
    macroProgress: {
      kcal: { current: totalMacros.kcal, target: targets.macros.kcal },
      protein: { current: totalMacros.protein, target: targets.macros.protein },
      fat: { current: totalMacros.fat, target: targets.macros.fat },
      carbs: { current: totalMacros.carbs, target: targets.macros.carbs },
    },
  };
}

// ============================================================================
// History
// ============================================================================

/**
 * Get nutrition history for past days
 */
export async function getNutritionHistory(
  clientId: string,
  days: number = 7,
  tenantId: string = DEFAULT_TENANT
): Promise<DailyNutritionLog[]> {
  try {
    const nutritionRef = collection(
      db,
      'tenants',
      tenantId,
      'clients',
      clientId,
      'nutrition'
    );

    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - days);

    const q = query(
      nutritionRef,
      where('date', '>=', startDate.toISOString().split('T')[0]),
      orderBy('date', 'desc'),
      limit(days)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as DailyNutritionLog[];
  } catch {
    return [];
  }
}

// ============================================================================
// Combined State Subscription
// ============================================================================

/**
 * Subscribe to complete daily nutrition state (targets + log combined)
 * This merges targets and log subscriptions into a single unified state
 */
export function subscribeToDailyState(
  clientId: string,
  date: string,
  onData: (state: DailyNutritionState) => void,
  onError?: (error: Error) => void,
  tenantId: string = DEFAULT_TENANT
): Unsubscribe {
  let targets: NutritionTargets | null = null;
  let log: DailyNutritionLog | null = null;
  let hasInitialTargets = false;

  const emitState = () => {
    if (!hasInitialTargets || !targets) return;
    const state = buildDailyNutritionState(date, targets, log);
    onData(state);
  };

  // Subscribe to targets
  const unsubTargets = subscribeToNutritionTargets(
    clientId,
    (t) => {
      targets = t;
      hasInitialTargets = true;
      emitState();
    },
    tenantId
  );

  // Subscribe to daily log
  const unsubLog = subscribeToDailyNutritionLog(
    clientId,
    date,
    (l) => {
      log = l;
      emitState();
    },
    tenantId
  );

  return () => {
    unsubTargets();
    unsubLog();
  };
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Log a meal with optional photo upload
 * Convenience wrapper around logMealEntry and uploadMealPhoto
 */
export async function logMeal(
  clientId: string,
  date: string,
  mealType: MealType,
  macros: MealMacros,
  photoFile?: File,
  tenantId: string = DEFAULT_TENANT
): Promise<MealLogEntry> {
  let photoUrl: string | undefined;
  let photoThumbnail: string | undefined;

  // Upload photo if provided
  if (photoFile) {
    const { promise } = uploadMealPhoto(clientId, mealType, photoFile, tenantId);
    const uploadResult = await promise;
    photoUrl = uploadResult.downloadUrl;
    photoThumbnail = uploadResult.downloadUrl; // For now, use same URL for thumbnail
  }

  // Log the meal entry
  return logMealEntry(
    clientId,
    date,
    {
      mealType,
      macros,
      photoUrl,
      photoThumbnail,
    },
    tenantId
  );
}

