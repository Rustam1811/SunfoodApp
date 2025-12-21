/**
 * Auth Service - Simple Phone + Password Authentication
 * 
 * Uses Firestore for user storage.
 * Firebase Auth is NOT used - custom auth flow.
 * 
 * @module services/authService
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
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ============================================================================
// Types
// ============================================================================

export type UserRole = 'client' | 'coach' | 'admin';
export type UserGoal = 'lose_weight' | 'gain_muscle' | 'maintain' | 'general_fitness';
export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

export interface User {
  id: string;
  phone: string;
  name: string;
  avatar?: string;
  role: UserRole;
  
  // Physical profile
  height?: number;
  weight?: number;
  targetWeight?: number;
  goal?: UserGoal;
  level?: UserLevel;
  
  // Trainer OS
  trainerId?: string; // Assigned coach ID (for clients)
  weeklyGoal?: number; // Workouts per week
  
  // Stats
  rank?: number;
  totalWorkouts?: number;
  points?: number;
  streak?: number;
  
  // Status
  isActive: boolean;
  onboardingCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

// ============================================================================
// Constants
// ============================================================================

const USERS_COLLECTION = 'users';
const SESSION_KEY = 'trainer_os_session';

// Admin credentials (fixed)
const ADMIN_PHONE = '+77001234567';
const ADMIN_PASSWORD = 'admin123';

// ============================================================================
// Session Management
// ============================================================================

export function saveSession(userId: string): void {
  localStorage.setItem(SESSION_KEY, userId);
}

export function getSession(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

// ============================================================================
// User CRUD
// ============================================================================

/**
 * Get user by ID from Firestore
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

/**
 * Get user by phone number
 */
export async function getUserByPhone(phone: string): Promise<User | null> {
  try {
    const usersQuery = query(
      collection(db, USERS_COLLECTION),
      where('phone', '==', phone)
    );
    
    const snapshot = await getDocs(usersQuery);
    
    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user by phone:', error);
    return null;
  }
}

/**
 * Create new user in Firestore
 */
export async function createUser(phone: string, password: string): Promise<User> {
  const userId = generateUserId();
  const now = new Date().toISOString();
  
  const userData: Omit<User, 'id'> & { password: string } = {
    phone,
    password, // In production, hash this!
    name: '',
    role: 'client',
    isActive: true,
    onboardingCompleted: false,
    totalWorkouts: 0,
    points: 0,
    streak: 0,
    weeklyGoal: 3,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  };
  
  await setDoc(doc(db, USERS_COLLECTION, userId), userData);
  
  return { id: userId, ...userData };
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: Partial<Pick<User, 'name' | 'avatar' | 'phone' | 'height' | 'weight' | 'targetWeight' | 'goal' | 'level' | 'weeklyGoal'>>
): Promise<void> {
  await updateDoc(doc(db, USERS_COLLECTION, userId), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Update user stats
 */
export async function updateUserStats(
  userId: string,
  stats: { rank?: number; totalWorkouts?: number; points?: number; streak?: number }
): Promise<void> {
  await updateDoc(doc(db, USERS_COLLECTION, userId), {
    ...stats,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Complete onboarding
 */
export async function completeOnboarding(userId: string): Promise<void> {
  await updateDoc(doc(db, USERS_COLLECTION, userId), {
    onboardingCompleted: true,
    updatedAt: new Date().toISOString(),
  });
}

// ============================================================================
// Authentication
// ============================================================================

interface AuthResult {
  success: boolean;
  user?: User;
  isNewUser?: boolean;
  error?: string;
}

/**
 * Login or register user
 * - If user exists and password matches: login
 * - If user exists and password doesn't match: error
 * - If user doesn't exist: create new user
 */
export async function loginOrRegister(phone: string, password: string): Promise<AuthResult> {
  // Check for admin
  if (phone === ADMIN_PHONE && password === ADMIN_PASSWORD) {
    const adminUser: User = {
      id: 'admin',
      phone: ADMIN_PHONE,
      name: 'Admin',
      role: 'admin',
      isActive: true,
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { success: true, user: adminUser, isNewUser: false };
  }
  
  try {
    // Check if user exists
    const existingUser = await getUserByPhone(phone);
    
    if (existingUser) {
      // User exists - verify password
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, existingUser.id));
      const userData = userDoc.data();
      
      if (userData?.password !== password) {
        return { success: false, error: 'Неверный пароль' };
      }
      
      // Update last login
      await updateDoc(doc(db, USERS_COLLECTION, existingUser.id), {
        lastLoginAt: new Date().toISOString(),
      });
      
      return { success: true, user: existingUser, isNewUser: false };
    } else {
      // New user - create account
      const newUser = await createUser(phone, password);
      return { success: true, user: newUser, isNewUser: true };
    }
  } catch (error) {
    console.error('Auth error:', error);
    return { success: false, error: 'Ошибка авторизации' };
  }
}

// ============================================================================
// Helpers
// ============================================================================

function generateUserId(): string {
  return 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Export legacy functions for compatibility
export const registerUser = createUser;
export const loginUser = loginOrRegister;
