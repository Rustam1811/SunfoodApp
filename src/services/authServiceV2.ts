/**
 * Auth Service V2 - Production-Ready Authentication
 * 
 * Clean, secure authentication with Firestore + bcrypt.
 * ALL users (clients, coaches, admins) authenticate via Firestore.
 * Passwords are hashed with bcrypt.
 * 
 * @module services/authServiceV2
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
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
  
  // Auth (internal, not exposed)
  passwordHash?: string;
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
const SESSIONS_COLLECTION = 'sessions';
const SESSION_KEY = 'trainer_os_session_token';
const BCRYPT_ROUNDS = 10;
const SESSION_EXPIRY_DAYS = 30;

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
 * ALL users (clients, coaches, admins) are authenticated via Firestore + bcrypt
 * Firebase Auth is NOT used for authentication
 */
export async function login(phone: string, password: string): Promise<AuthResult> {
  // Validate input
  if (!phone || !password) {
    return { success: false, error: 'Введите телефон и пароль', errorCode: 'INVALID_INPUT' };
  }
  
  // Find user by phone
  const existingUser = await getUserByPhone(phone);
  
  if (!existingUser) {
    return { success: false, error: 'Пользователь не найден', errorCode: 'USER_NOT_FOUND' };
  }
  
  // All users authenticate via bcrypt (staff and clients)
  return handlePasswordLogin(existingUser, password);
}

/**
 * Handle login with bcrypt password verification (for all users)
 */
async function handlePasswordLogin(user: UserProfile, password: string): Promise<AuthResult> {
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, user.id));
  const userData = userDoc.data();
  const storedHash = userData?.passwordHash;
  
  // Legacy support: check plaintext password field
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
  await createSession(user.id);
  
  return {
    success: true,
    user: user,
    needsOnboarding: !user.onboardingCompleted,
  };
}

/**
 * Register new user with phone and password
 * Creates user in Firestore with bcrypt-hashed password
 */
export async function register(
  phone: string,
  password: string,
  role: UserRole = 'client'
): Promise<AuthResult> {
  // Check if user already exists
  const existingUser = await getUserByPhone(phone);
  if (existingUser) {
    return {
      success: false,
      error: 'Пользователь с таким номером уже существует',
      errorCode: 'USER_EXISTS',
    };
  }
  
  // Generate unique ID for user
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Hash password
  const passwordHash = await hashPassword(password);
  
  // Create user profile with password hash
  const profile = await createUserProfile(userId, phone, role, { passwordHash });
  
  await createSession(userId);
  
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
  await clearSession();
}

/**
 * Get current authenticated user profile
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  // Check session
  const sessionUserId = await validateSession();
  if (sessionUserId) {
    return getUserProfile(sessionUserId);
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
// Session Management - Firestore-based for cross-device auth
// ============================================================================

interface SessionData {
  userId: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  deviceInfo?: string;
}

/**
 * Generate random session token
 */
function generateSessionToken(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create session in Firestore and save token to localStorage
 */
async function createSession(userId: string): Promise<string> {
  const token = generateSessionToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  
  const sessionData: SessionData = {
    userId,
    token,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    deviceInfo: navigator.userAgent.substring(0, 100),
  };
  
  // Save to Firestore
  await setDoc(doc(db, SESSIONS_COLLECTION, token), sessionData);
  
  // Save token to localStorage
  try {
    localStorage.setItem(SESSION_KEY, token);
  } catch {
    // localStorage not available
  }
  
  return token;
}

/**
 * Get session from Firestore by token
 */
async function getSessionData(token: string): Promise<SessionData | null> {
  try {
    const sessionDoc = await getDoc(doc(db, SESSIONS_COLLECTION, token));
    
    if (!sessionDoc.exists()) {
      return null;
    }
    
    const data = sessionDoc.data() as SessionData;
    
    // Check if expired
    if (new Date(data.expiresAt) < new Date()) {
      // Delete expired session
      await deleteDoc(doc(db, SESSIONS_COLLECTION, token));
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Get current session token from localStorage
 */
function getSessionToken(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

/**
 * Validate session and return userId
 */
async function validateSession(): Promise<string | null> {
  const token = getSessionToken();
  if (!token) return null;
  
  const sessionData = await getSessionData(token);
  if (!sessionData) {
    clearSessionToken();
    return null;
  }
  
  return sessionData.userId;
}

/**
 * Clear session token from localStorage
 */
function clearSessionToken(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // localStorage not available
  }
}

/**
 * Delete session from Firestore
 */
async function deleteSession(token: string): Promise<void> {
  try {
    await deleteDoc(doc(db, SESSIONS_COLLECTION, token));
  } catch (error) {
    console.error('Error deleting session:', error);
  }
}

// Legacy exports for compatibility
export function saveSession(userId: string): void {
  createSession(userId).catch(console.error);
}

export async function getSession(): Promise<string | null> {
  return validateSession();
}

export async function clearSession(): Promise<void> {
  const token = getSessionToken();
  if (token) {
    await deleteSession(token);
  }
  clearSessionToken();
}

// ============================================================================
// Auth State Subscription
// ============================================================================

/**
 * Subscribe to auth state changes
 * Session-based authentication with Firestore
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
  
  // Check session - validate token from Firestore
  validateSession().then(sessionUserId => {
    if (sessionUserId) {
      subscribeToProfile(sessionUserId);
      initialized = true;
    } else {
      // No session - user is logged out
      callback(null, false);
      initialized = true;
    }
  }).catch(() => {
    callback(null, false);
    initialized = true;
  });
  
  return () => {
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
