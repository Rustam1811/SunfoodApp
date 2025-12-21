/**
 * Exercise Base Service - Trainer OS
 * 
 * Manages the exercise library:
 * - Global exercises (admin-created)
 * - Coach exercises (coach-created)
 * - Categories, search, reuse
 * 
 * @module services/exerciseService
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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';

// ============================================================================
// Types
// ============================================================================

export type ExerciseCategory = 
  | 'chest' 
  | 'back' 
  | 'shoulders' 
  | 'biceps' 
  | 'triceps' 
  | 'legs' 
  | 'glutes' 
  | 'core' 
  | 'cardio' 
  | 'stretching'
  | 'compound'
  | 'functional';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  description: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  equipment?: string[];
  muscleGroups: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  instructions?: string[];
  createdBy: string; // coachId or 'system'
  isGlobal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExerciseData {
  name: string;
  category: ExerciseCategory;
  description: string;
  equipment?: string[];
  muscleGroups: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  instructions?: string[];
}

// ============================================================================
// Constants
// ============================================================================

const EXERCISES_COLLECTION = 'exercises';

export const CATEGORY_NAMES: Record<ExerciseCategory, string> = {
  chest: 'Грудь',
  back: 'Спина',
  shoulders: 'Плечи',
  biceps: 'Бицепс',
  triceps: 'Трицепс',
  legs: 'Ноги',
  glutes: 'Ягодицы',
  core: 'Пресс',
  cardio: 'Кардио',
  stretching: 'Растяжка',
  compound: 'Базовые',
  functional: 'Функциональные',
};

export const ALL_CATEGORIES: ExerciseCategory[] = [
  'compound',
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'legs',
  'glutes',
  'core',
  'cardio',
  'stretching',
  'functional',
];

export const COMMON_EQUIPMENT = [
  'Штанга',
  'Гантели',
  'Гиря',
  'Тренажёр',
  'Турник',
  'Брусья',
  'Резиновая лента',
  'Фитбол',
  'Скамья',
  'Кабельный тренажёр',
  'Свой вес',
];

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Create a new exercise
 */
export async function createExercise(
  data: CreateExerciseData,
  createdBy: string,
  isGlobal: boolean = false
): Promise<string> {
  const now = new Date().toISOString();
  
  const exerciseData: Omit<Exercise, 'id'> = {
    ...data,
    createdBy,
    isGlobal,
    createdAt: now,
    updatedAt: now,
  };
  
  const docRef = await addDoc(collection(db, EXERCISES_COLLECTION), exerciseData);
  return docRef.id;
}

/**
 * Upload exercise video
 */
export async function uploadExerciseVideo(
  exerciseId: string,
  videoBlob: Blob
): Promise<string> {
  const storagePath = `exercises/${exerciseId}/demo.mp4`;
  const storageRef = ref(storage, storagePath);
  
  await uploadBytes(storageRef, videoBlob);
  const videoUrl = await getDownloadURL(storageRef);
  
  // Update exercise document
  const docRef = doc(db, EXERCISES_COLLECTION, exerciseId);
  await updateDoc(docRef, { 
    videoUrl,
    updatedAt: new Date().toISOString(),
  });
  
  return videoUrl;
}

/**
 * Get exercise by ID
 */
export async function getExerciseById(exerciseId: string): Promise<Exercise | null> {
  try {
    const docRef = doc(db, EXERCISES_COLLECTION, exerciseId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    return { id: docSnap.id, ...docSnap.data() } as Exercise;
  } catch (error) {
    console.error('Error getting exercise:', error);
    return null;
  }
}

/**
 * Get all global exercises
 */
export async function getGlobalExercises(): Promise<Exercise[]> {
  try {
    const exercisesQuery = query(
      collection(db, EXERCISES_COLLECTION),
      where('isGlobal', '==', true),
      orderBy('name', 'asc')
    );
    
    const snapshot = await getDocs(exercisesQuery);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Exercise));
  } catch (error) {
    console.error('Error getting global exercises:', error);
    return [];
  }
}

/**
 * Get exercises by coach (coach's custom exercises)
 */
export async function getCoachExercises(coachId: string): Promise<Exercise[]> {
  try {
    const exercisesQuery = query(
      collection(db, EXERCISES_COLLECTION),
      where('createdBy', '==', coachId),
      where('isGlobal', '==', false),
      orderBy('name', 'asc')
    );
    
    const snapshot = await getDocs(exercisesQuery);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Exercise));
  } catch (error) {
    console.error('Error getting coach exercises:', error);
    return [];
  }
}

/**
 * Get all available exercises for a coach (global + own)
 */
export async function getAllAvailableExercises(coachId: string): Promise<Exercise[]> {
  const [globalExercises, coachExercises] = await Promise.all([
    getGlobalExercises(),
    getCoachExercises(coachId),
  ]);
  
  return [...globalExercises, ...coachExercises];
}

/**
 * Get exercises by category
 */
export async function getExercisesByCategory(
  category: ExerciseCategory,
  coachId?: string
): Promise<Exercise[]> {
  try {
    // Get global exercises in category
    const globalQuery = query(
      collection(db, EXERCISES_COLLECTION),
      where('isGlobal', '==', true),
      where('category', '==', category),
      orderBy('name', 'asc')
    );
    
    const globalSnapshot = await getDocs(globalQuery);
    const globalExercises = globalSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Exercise));
    
    if (!coachId) return globalExercises;
    
    // Get coach's exercises in category
    const coachQuery = query(
      collection(db, EXERCISES_COLLECTION),
      where('createdBy', '==', coachId),
      where('category', '==', category),
      where('isGlobal', '==', false),
      orderBy('name', 'asc')
    );
    
    const coachSnapshot = await getDocs(coachQuery);
    const coachExercises = coachSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Exercise));
    
    return [...globalExercises, ...coachExercises];
  } catch (error) {
    console.error('Error getting exercises by category:', error);
    return [];
  }
}

/**
 * Search exercises by name
 */
export async function searchExercises(
  searchTerm: string,
  coachId?: string
): Promise<Exercise[]> {
  // Firestore doesn't support full-text search, so we get all and filter
  const allExercises = coachId 
    ? await getAllAvailableExercises(coachId)
    : await getGlobalExercises();
  
  const term = searchTerm.toLowerCase();
  
  return allExercises.filter(ex => 
    ex.name.toLowerCase().includes(term) ||
    ex.description.toLowerCase().includes(term) ||
    ex.muscleGroups.some(mg => mg.toLowerCase().includes(term))
  );
}

/**
 * Update exercise
 */
export async function updateExercise(
  exerciseId: string,
  data: Partial<CreateExerciseData>
): Promise<void> {
  const docRef = doc(db, EXERCISES_COLLECTION, exerciseId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete exercise
 */
export async function deleteExercise(exerciseId: string): Promise<void> {
  const docRef = doc(db, EXERCISES_COLLECTION, exerciseId);
  await deleteDoc(docRef);
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Get category name in Russian
 */
export function getCategoryName(category: ExerciseCategory): string {
  return CATEGORY_NAMES[category] || category;
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: ExerciseCategory): string {
  const icons: Record<ExerciseCategory, string> = {
    chest: '💪',
    back: '🔙',
    shoulders: '🏋️',
    biceps: '💪',
    triceps: '💪',
    legs: '🦵',
    glutes: '🍑',
    core: '🎯',
    cardio: '❤️',
    stretching: '🧘',
    compound: '⚡',
    functional: '🔄',
  };
  return icons[category] || '🏋️';
}

/**
 * Group exercises by category
 */
export function groupByCategory(exercises: Exercise[]): Map<ExerciseCategory, Exercise[]> {
  const grouped = new Map<ExerciseCategory, Exercise[]>();
  
  exercises.forEach(ex => {
    const existing = grouped.get(ex.category) || [];
    existing.push(ex);
    grouped.set(ex.category, existing);
  });
  
  return grouped;
}

/**
 * Format muscle groups for display
 */
export function formatMuscleGroups(muscleGroups: string[]): string {
  return muscleGroups.join(', ');
}

/**
 * Format equipment for display
 */
export function formatEquipment(equipment?: string[]): string {
  if (!equipment || equipment.length === 0) return 'Без оборудования';
  return equipment.join(', ');
}

/**
 * Get difficulty name in Russian
 */
export function getDifficultyName(difficulty?: 'beginner' | 'intermediate' | 'advanced'): string {
  switch (difficulty) {
    case 'beginner': return 'Начальный';
    case 'intermediate': return 'Средний';
    case 'advanced': return 'Продвинутый';
    default: return '—';
  }
}

/**
 * Get difficulty color class
 */
export function getDifficultyColor(difficulty?: 'beginner' | 'intermediate' | 'advanced'): string {
  switch (difficulty) {
    case 'beginner': return 'text-green-500';
    case 'intermediate': return 'text-yellow-500';
    case 'advanced': return 'text-red-500';
    default: return 'text-gray-500';
  }
}

// ============================================================================
// Aliases for Trainer OS v2 Pages
// ============================================================================

/**
 * Get exercises - alias for getAllAvailableExercises
 */
export async function getExercises(coachId?: string): Promise<Exercise[]> {
  if (coachId) {
    return getAllAvailableExercises(coachId);
  }
  return getGlobalExercises();
}
