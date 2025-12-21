/**
 * Firebase Auth Configuration
 * 
 * Production-ready Firebase Auth setup using phone-as-email pattern.
 * Phone numbers are converted to email format: +77771234567 → 77771234567@trainer.app
 * 
 * This provides:
 * - Secure password hashing (handled by Firebase)
 * - Session management via Firebase Auth tokens
 * - Support for password reset flows
 * 
 * @module lib/firebaseAuth
 */

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User as FirebaseUser,
  type Auth,
  type Unsubscribe,
} from 'firebase/auth';
import { getApp } from 'firebase/app';

// ============================================================================
// Initialize Auth
// ============================================================================

let auth: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getApp());
  }
  return auth;
}

// ============================================================================
// Phone-to-Email Conversion
// ============================================================================

const AUTH_EMAIL_DOMAIN = 'trainer.app';

/**
 * Convert phone number to email format for Firebase Auth
 * +77771234567 → 77771234567@trainer.app
 */
export function phoneToEmail(phone: string): string {
  // Remove all non-digit characters except leading +
  const cleaned = phone.replace(/[^\d]/g, '');
  return `${cleaned}@${AUTH_EMAIL_DOMAIN}`;
}

/**
 * Extract phone from Firebase Auth email
 * 77771234567@trainer.app → +77771234567
 */
export function emailToPhone(email: string): string {
  const parts = email.split('@');
  if (parts[1] === AUTH_EMAIL_DOMAIN) {
    return `+${parts[0]}`;
  }
  return email;
}

/**
 * Check if email is a phone-based auth email
 */
export function isPhoneEmail(email: string): boolean {
  return email.endsWith(`@${AUTH_EMAIL_DOMAIN}`);
}

// ============================================================================
// Auth Functions
// ============================================================================

export interface AuthResult {
  success: boolean;
  user?: FirebaseUser;
  isNewUser?: boolean;
  error?: string;
  errorCode?: string;
}

/**
 * Sign in with phone and password
 */
export async function signInWithPhone(phone: string, password: string): Promise<AuthResult> {
  const auth = getFirebaseAuth();
  const email = phoneToEmail(phone);

  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: credential.user,
      isNewUser: false,
    };
  } catch (error: any) {
    // If user doesn't exist, we might want to create them
    if (error.code === 'auth/user-not-found') {
      return {
        success: false,
        error: 'Пользователь не найден',
        errorCode: 'user-not-found',
      };
    }
    if (error.code === 'auth/wrong-password') {
      return {
        success: false,
        error: 'Неверный пароль',
        errorCode: 'wrong-password',
      };
    }
    if (error.code === 'auth/invalid-email') {
      return {
        success: false,
        error: 'Неверный формат телефона',
        errorCode: 'invalid-phone',
      };
    }
    if (error.code === 'auth/too-many-requests') {
      return {
        success: false,
        error: 'Слишком много попыток. Попробуйте позже',
        errorCode: 'too-many-requests',
      };
    }
    
    console.error('Sign in error:', error);
    return {
      success: false,
      error: 'Ошибка авторизации',
      errorCode: error.code,
    };
  }
}

/**
 * Create new user with phone and password
 */
export async function createUserWithPhone(phone: string, password: string): Promise<AuthResult> {
  const auth = getFirebaseAuth();
  const email = phoneToEmail(phone);

  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: credential.user,
      isNewUser: true,
    };
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      return {
        success: false,
        error: 'Этот номер уже зарегистрирован',
        errorCode: 'phone-already-exists',
      };
    }
    if (error.code === 'auth/weak-password') {
      return {
        success: false,
        error: 'Пароль должен быть минимум 6 символов',
        errorCode: 'weak-password',
      };
    }
    if (error.code === 'auth/invalid-email') {
      return {
        success: false,
        error: 'Неверный формат телефона',
        errorCode: 'invalid-phone',
      };
    }

    console.error('Create user error:', error);
    return {
      success: false,
      error: 'Ошибка регистрации',
      errorCode: error.code,
    };
  }
}

/**
 * Sign in or create user (unified flow)
 */
export async function signInOrCreate(phone: string, password: string): Promise<AuthResult> {
  // First try to sign in
  const signInResult = await signInWithPhone(phone, password);
  
  if (signInResult.success) {
    return signInResult;
  }
  
  // If user not found, create new account
  if (signInResult.errorCode === 'user-not-found') {
    return createUserWithPhone(phone, password);
  }
  
  // Return original error
  return signInResult;
}

/**
 * Sign out current user
 */
export async function firebaseSignOut(): Promise<void> {
  const auth = getFirebaseAuth();
  await signOut(auth);
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): FirebaseUser | null {
  const auth = getFirebaseAuth();
  return auth.currentUser;
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
  callback: (user: FirebaseUser | null) => void
): Unsubscribe {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, callback);
}

/**
 * Get ID token for API calls
 */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const user = getCurrentUser();
  if (!user) return null;
  
  try {
    return await user.getIdToken(forceRefresh);
  } catch {
    return null;
  }
}

/**
 * Change user password
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  
  if (!user || !user.email) {
    return { success: false, error: 'Пользователь не авторизован' };
  }

  try {
    // Re-authenticate first
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update password
    await updatePassword(user, newPassword);
    return { success: true };
  } catch (error: any) {
    if (error.code === 'auth/wrong-password') {
      return { success: false, error: 'Неверный текущий пароль' };
    }
    if (error.code === 'auth/weak-password') {
      return { success: false, error: 'Новый пароль слишком простой' };
    }
    return { success: false, error: 'Ошибка смены пароля' };
  }
}

/**
 * Delete user account
 */
export async function deleteAccount(
  password: string
): Promise<{ success: boolean; error?: string }> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  
  if (!user || !user.email) {
    return { success: false, error: 'Пользователь не авторизован' };
  }

  try {
    // Re-authenticate first
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    
    // Delete user
    await user.delete();
    return { success: true };
  } catch (error: any) {
    if (error.code === 'auth/wrong-password') {
      return { success: false, error: 'Неверный пароль' };
    }
    return { success: false, error: 'Ошибка удаления аккаунта' };
  }
}
