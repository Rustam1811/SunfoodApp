/**
 * Auth Service V2 - Production-Ready Authentication
 * 
 * Clean, secure authentication with Firebase Auth + Firestore profiles.
 * Uses phone-as-email pattern for Firebase Auth.
 * Staff (coach/admin) passwords are hashed with bcrypt.
 * 
 * @module services/authServiceV2
 */

import {
  signInOrCreate,
  createUserWithPhone,
  firebaseSignOut,
  getCurrentUser,
  onAuthStateChange,
  getIdToken,
  type AuthResult as FirebaseAuthResult,
} from '../lib/firebaseAuth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import bcrypt from 'bcryptjs';

// ============================================================================
// Types
// ============================================================================

export type UserRole = 'client' | 'coach' | 'admin';
export type UserGoal = 'lose_weight' | 'gain_muscle' | 'maintain' | 'general_fitness';
export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UserProfile {
  id: string; // Firebase Auth UID
  phone: string;
  email?: string; // For coaches with real email
  name: string;
  avatar?: string;
  role: UserRole;
  
  // Physical profile (for clients)
  height?: number;
  weight?: number;
  targetWeight?: number;
  goal?: UserGoal;
  level?: UserLevel;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  
  // Trainer relationship (for clients)
  trainerId?: string;
  trainerName?: string;
  tenantId?: string;
  
  // Training preferences
  weeklyGoal?: number; // workouts per week
  preferredTime?: 'morning' | 'afternoon' | 'evening';
  equipment?: string[];
  injuries?: string[];
  
  // Stats & Gamification
  rank?: number;
  totalWorkouts?: number;
  points?: number;
  streak?: number;
  
  // Status flags
  isActive: boolean;
  onboardingCompleted: boolean;
  profileCompleted: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface OnboardingData {
  name: string;
  height?: number;
  weight?: number;
  goal?: UserGoal;
  level?: UserLevel;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  weeklyGoal?: number;
}

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  isNewUser?: boolean;
  needsOnboarding?: boolean;
  error?: string;
  errorCode?: string;
}

// ============================================================================
// Constants
// ============================================================================

const USERS_COLLECTION = 'users';
const SESSION_KEY = 'trainer_os_auth';
const BCRYPT_ROUNDS = 10;

// ============================================================================
// Password Hashing (for staff accounts)
// ============================================================================

/**
 * Hash password with bcrypt
 */
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify password against hash
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================================================
// User Profile Management
// ============================================================================

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Get user profile by phone number
 */
export async function getUserByPhone(phone: string): Promise<UserProfile | null> {
  try {
    const usersQuery = query(
      collection(db, USERS_COLLECTION),
      where('phone', '==', phone)
    );
    
    const snapshot = await getDocs(usersQuery);
    
    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() } as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user by phone:', error);
    return null;
  }
}

/**
 * Create user profile in Firestore
 */
export async function createUserProfile(
  userId: string,
  phone: string,
  role: UserRole = 'client',
  additionalData: Partial<UserProfile> = {}
): Promise<UserProfile> {
  const now = new Date().toISOString();
  
  const profileData: Omit<UserProfile, 'id'> = {
    phone,
    name: additionalData.name || '',
    role,
    isActive: true,
    onboardingCompleted: role !== 'client', // Coaches/admins skip onboarding
    profileCompleted: role !== 'client',
    totalWorkouts: 0,
    points: 0,
    streak: 0,
    weeklyGoal: 3,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
    ...additionalData,
  };
  
  await setDoc(doc(db, USERS_COLLECTION, userId), profileData);
  
  return { id: userId, ...profileData };
}

/**
 * Create staff user (coach/admin) with hashed password
 */
export async function createStaffUser(
  phone: string,
  password: string,
  role: 'coach' | 'admin',
  name: string
): Promise<UserProfile> {
  const userId = `staff_${phone.replace(/\D/g, '')}`;
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();
  
  const profileData = {
    phone,
    name,
    role,
    passwordHash,
    isActive: true,
    onboardingCompleted: true,
    profileCompleted: true,
    totalWorkouts: 0,
    points: 0,
    streak: 0,
    weeklyGoal: 0,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  };
  
  await setDoc(doc(db, USERS_COLLECTION, userId), profileData);
  
  return { id: userId, ...profileData } as UserProfile;
}

/**
 * Update staff password with bcrypt hash
 */
export async function updateStaffPassword(userId: string, newPassword: string): Promise<void> {
  const passwordHash = await hashPassword(newPassword);
  await updateDoc(doc(db, USERS_COLLECTION, userId), {
    passwordHash,
    password: null, // Remove any legacy plaintext
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: Partial<UserProfile>
): Promise<void> {
  const updateData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  
  // Remove id from update data if present
  delete (updateData as any).id;
  
  await updateDoc(doc(db, USERS_COLLECTION, userId), updateData);
}

/**
 * Subscribe to user profile changes
 */
export function subscribeToUserProfile(
  userId: string,
  callback: (user: UserProfile | null) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, USERS_COLLECTION, userId),
    (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as UserProfile);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('User profile subscription error:', error);
      callback(null);
    }
  );
}

// ============================================================================
// Authentication Functions
// ============================================================================

/**
 * Login with phone and password
 * - Staff (coach/admin): verifies bcrypt-hashed password from Firestore
 * - Client: uses Firebase Auth
 */
export async function login(phone: string, password: string): Promise<AuthResult> {
  // Validate input
  if (!phone || !password) {
    return { success: false, error: 'Введите телефон и пароль', errorCode: 'INVALID_INPUT' };
  }
  
  // Check if user exists with staff role
  const existingUser = await getUserByPhone(phone);
  
  if (existingUser && (existingUser.role === 'coach' || existingUser.role === 'admin')) {
    return handleStaffLogin(existingUser, password);
  }
  
  // For clients: use Firebase Auth
  const authResult = await signInOrCreate(phone, password);
  
  if (!authResult.success || !authResult.user) {
    return {
      success: false,
      error: authResult.error || 'Ошибка авторизации',
      errorCode: authResult.errorCode,
    };
  }
  
  const firebaseUser = authResult.user;
  
  // Get or create Firestore profile
  let profile = await getUserProfile(firebaseUser.uid);
  
  if (!profile) {
    profile = await createUserProfile(firebaseUser.uid, phone, 'client');
  } else {
    await updateUserProfile(firebaseUser.uid, { lastLoginAt: new Date().toISOString() });
  }
  
  saveSession(firebaseUser.uid);
  
  return {
    success: true,
    user: profile,
    isNewUser: authResult.isNewUser,
    needsOnboarding: !profile.onboardingCompleted,
  };
}

/**
 * Handle staff (coach/admin) login with bcrypt password verification
 */
async function handleStaffLogin(user: UserProfile, password: string): Promise<AuthResult> {
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, user.id));
  const userData = userDoc.data();
  const storedHash = userData?.passwordHash;
  
  // Legacy support: check plaintext password and migrate
  const legacyPassword = userData?.password;
  
  if (!storedHash && !legacyPassword) {
    return {
      success: false,
      error: 'Пароль не установлен. Обратитесь к администратору.',
      errorCode: 'NO_PASSWORD',
    };
  }
  
  let isValid = false;
  
  // First try bcrypt hash if exists
  if (storedHash) {
    isValid = await verifyPassword(password, storedHash);
  }
  
  // If bcrypt failed or doesn't exist, try plaintext (for manual Firestore edits)
  if (!isValid && legacyPassword) {
    isValid = legacyPassword === password;
    if (isValid) {
      // Migrate to bcrypt hash
      const newHash = await hashPassword(password);
      await updateDoc(doc(db, USERS_COLLECTION, user.id), {
        passwordHash: newHash,
        password: null, // Remove plaintext
      });
    }
  }
  
  if (!isValid) {
    return { success: false, error: 'Неверный пароль', errorCode: 'WRONG_PASSWORD' };
  }
  
  await updateUserProfile(user.id, { lastLoginAt: new Date().toISOString() });
  saveSession(user.id);
  
  return {
    success: true,
    user: user,
    isNewUser: false,
    needsOnboarding: false,
  };
}

/**
 * Register new user with phone and password
 */
export async function register(
  phone: string,
  password: string,
  role: UserRole = 'client'
): Promise<AuthResult> {
  const authResult = await createUserWithPhone(phone, password);
  
  if (!authResult.success || !authResult.user) {
    return {
      success: false,
      error: authResult.error,
      errorCode: authResult.errorCode,
    };
  }
  
  const firebaseUser = authResult.user;
  
  // Create Firestore profile
  const profile = await createUserProfile(firebaseUser.uid, phone, role);
  
  saveSession(firebaseUser.uid);
  
  return {
    success: true,
    user: profile,
    isNewUser: true,
    needsOnboarding: role === 'client',
  };
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  try {
    await firebaseSignOut();
  } catch {
    // Ignore Firebase sign out errors (e.g., for demo users)
  }
  clearSession();
}

/**
 * Get current authenticated user profile
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  // Check session first
  const sessionUserId = getSession();
  if (sessionUserId) {
    return getUserProfile(sessionUserId);
  }
  
  // Check Firebase Auth
  const firebaseUser = getCurrentUser();
  if (firebaseUser) {
    return getUserProfile(firebaseUser.uid);
  }
  
  return null;
}

// ============================================================================
// Onboarding Functions
// ============================================================================

/**
 * Check if user needs onboarding
 */
export function needsOnboarding(user: UserProfile | null): boolean {
  if (!user) return false;
  
  // Only clients need onboarding
  if (user.role !== 'client') return false;
  
  return !user.onboardingCompleted;
}

/**
 * Check if user profile is complete
 */
export function isProfileComplete(user: UserProfile | null): boolean {
  if (!user) return false;
  
  // Required fields for complete profile
  const hasName = !!user.name && user.name.trim().length > 0;
  const hasPhysical = !!user.height && !!user.weight;
  const hasGoal = !!user.goal;
  
  return hasName && hasPhysical && hasGoal;
}

/**
 * Complete onboarding with user data
 */
export async function completeOnboarding(
  userId: string,
  data: OnboardingData
): Promise<UserProfile> {
  const updateData: Partial<UserProfile> = {
    ...data,
    onboardingCompleted: true,
    profileCompleted: isProfileComplete({ ...data } as UserProfile),
    updatedAt: new Date().toISOString(),
  };
  
  await updateUserProfile(userId, updateData);
  
  const profile = await getUserProfile(userId);
  return profile!;
}

/**
 * Skip onboarding (mark as completed without data)
 */
export async function skipOnboarding(userId: string): Promise<void> {
  await updateUserProfile(userId, {
    onboardingCompleted: true,
  });
}

// ============================================================================
// Role-Based Access Control
// ============================================================================

/**
 * Check if user has specific role
 */
export function hasRole(user: UserProfile | null, role: UserRole): boolean {
  return user?.role === role;
}

/**
 * Check if user has one of the specified roles
 */
export function hasAnyRole(user: UserProfile | null, roles: UserRole[]): boolean {
  return user ? roles.includes(user.role) : false;
}

/**
 * Check if user can access coach features
 */
export function canAccessCoachFeatures(user: UserProfile | null): boolean {
  return hasAnyRole(user, ['coach', 'admin']);
}

/**
 * Check if user can access admin features
 */
export function canAccessAdminFeatures(user: UserProfile | null): boolean {
  return hasRole(user, 'admin');
}

/**
 * Get redirect path based on user role and state
 */
export function getRedirectPath(user: UserProfile | null): string {
  if (!user) return '/login';
  
  // Check onboarding for clients
  if (user.role === 'client' && !user.onboardingCompleted) {
    return '/onboarding';
  }
  
  // Role-based default paths
  switch (user.role) {
    case 'admin':
      return '/admin';
    case 'coach':
      return '/coach/clients';
    case 'client':
    default:
      return '/main';
  }
}

// ============================================================================
// Session Management
// ============================================================================

export function saveSession(userId: string): void {
  try {
    localStorage.setItem(SESSION_KEY, userId);
  } catch {
    // localStorage not available
  }
}

export function getSession(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // localStorage not available
  }
}

// ============================================================================
// Auth State Subscription
// ============================================================================

/**
 * Subscribe to auth state changes
 * Combines Firebase Auth state with Firestore profile
 */
export function subscribeToAuthState(
  callback: (user: UserProfile | null, loading: boolean) => void
): Unsubscribe {
  let profileUnsubscribe: Unsubscribe | null = null;
  let currentUserId: string | null = null;
  let initialized = false;
  
  // Helper to subscribe to profile
  const subscribeToProfile = (userId: string) => {
    if (currentUserId === userId && profileUnsubscribe) {
      // Already subscribed to this user
      return;
    }
    
    // Clean up previous subscription
    if (profileUnsubscribe) {
      profileUnsubscribe();
      profileUnsubscribe = null;
    }
    
    currentUserId = userId;
    profileUnsubscribe = subscribeToUserProfile(userId, (profile) => {
      callback(profile, false);
    });
  };
  
  // First check session - staff users have session but no Firebase Auth
  const sessionUserId = getSession();
  if (sessionUserId) {
    subscribeToProfile(sessionUserId);
    initialized = true;
  }
  
  // Subscribe to Firebase Auth state changes
  const authUnsubscribe = onAuthStateChange(async (firebaseUser) => {
    // Re-check session on every auth state change (may have changed)
    const currentSession = getSession();
    
    if (firebaseUser) {
      // Firebase user logged in - use Firebase UID
      saveSession(firebaseUser.uid);
      subscribeToProfile(firebaseUser.uid);
    } else if (currentSession) {
      // No Firebase user but we have session (staff login)
      // Subscribe to session user's profile
      subscribeToProfile(currentSession);
    } else {
      // No Firebase user and no session - user is logged out
      if (profileUnsubscribe) {
        profileUnsubscribe();
        profileUnsubscribe = null;
      }
      currentUserId = null;
      callback(null, false);
    }
    
    initialized = true;
  });
  
  // If no session, set loading to false after first auth check
  if (!initialized) {
    callback(null, true); // Still loading until onAuthStateChange fires
  }
  
  return () => {
    authUnsubscribe();
    if (profileUnsubscribe) {
      profileUnsubscribe();
    }
  };
}

// ============================================================================
// Exports for Legacy Compatibility
// ============================================================================

export const loginOrRegister = login;
export const getUserById = getUserProfile;
export { getIdToken };
