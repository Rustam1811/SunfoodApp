/**
 * Firebase Singleton Configuration
 * 
 * ЕДИНСТВЕННЫЙ файл инициализации Firebase для всего приложения.
 * Экспортирует: app, db, storage, messaging, analytics
 * 
 * Firebase Auth НЕ используется - авторизация через Firestore (см. authService.ts)
 * 
 * ⚠️ ВАЖНО: Импортируй db, storage и прочие сервисы ТОЛЬКО из этого файла!
 * НЕ импортируй getFirestore, getStorage напрямую из 'firebase/firestore' и т.д.
 */

// ============================================================================
// ИМПОРТЫ - СТРОГО MODULAR SDK (НЕ compat!)
// ============================================================================
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  initializeFirestore,
  getFirestore, 
  Firestore,
  memoryLocalCache,
  // Re-export types and functions for consumers
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch,
  Timestamp,
  type Unsubscribe,
  type DocumentReference,
  type CollectionReference,
  type Query,
  type QuerySnapshot,
  type DocumentSnapshot,
  type FieldValue,
} from 'firebase/firestore';
import { 
  getStorage, 
  FirebaseStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { 
  getMessaging, 
  Messaging,
  getToken,
  onMessage,
  deleteToken,
} from 'firebase/messaging';
import { 
  getAnalytics, 
  isSupported, 
  Analytics 
} from 'firebase/analytics';

// ============================================================================
// КОНФИГУРАЦИЯ
// ============================================================================

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined,
};

// ============================================================================
// ВАЛИДАЦИЯ ENV
// ============================================================================
const REQUIRED_KEYS = [
  'apiKey', 
  'authDomain', 
  'projectId', 
  'storageBucket', 
  'messagingSenderId', 
  'appId'
] as const;

const missingKeys = REQUIRED_KEYS.filter(key => {
  const value = firebaseConfig[key];
  return !value || value === 'undefined' || value.trim() === '';
});

if (missingKeys.length > 0) {
  const ENV_NAMES: Record<string, string> = {
    apiKey: 'VITE_FIREBASE_API_KEY',
    authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
    projectId: 'VITE_FIREBASE_PROJECT_ID',
    storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
    messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
    appId: 'VITE_FIREBASE_APP_ID',
  };

  const errorMsg = `
🔥 Firebase Configuration Error
Missing environment variables: ${missingKeys.map(k => ENV_NAMES[k]).join(', ')}

Ensure .env.local contains:
${missingKeys.map(k => `${ENV_NAMES[k]}=your_value`).join('\n')}
`;
  console.error(errorMsg);
  throw new Error(`Missing Firebase config: ${missingKeys.join(', ')}`);
}

// ============================================================================
// SINGLETON ИНИЦИАЛИЗАЦИЯ
// ============================================================================
let messaging: Messaging | null = null;
let analytics: Analytics | null = null;

// Инициализация App (только один раз)
let app: FirebaseApp;
const existingApps = getApps();

if (existingApps.length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Firestore - с memory cache вместо IndexedDB чтобы избежать ошибок
let db: Firestore;
try {
  // Используем memoryLocalCache для избежания ошибок IndexedDB
  if (existingApps.length === 0) {
    db = initializeFirestore(app, {
      localCache: memoryLocalCache(),
    });
  } else {
    db = getFirestore(app);
  }
} catch (e) {
  console.error('[Firebase] Failed to initialize Firestore:', e);
  // Fallback to standard getFirestore
  db = getFirestore(app);
}

// Storage - сразу после app  
const storage: FirebaseStorage = getStorage(app);

// Messaging - только в браузере, ленивая инициализация
function getMessagingInstance(): Messaging | null {
  if (typeof window === 'undefined') return null;
  if (messaging) return messaging;
  
  try {
    messaging = getMessaging(app);
    return messaging;
  } catch (e) {
    console.warn('Firebase Messaging not available:', e);
    return null;
  }
}

// Analytics - только в браузере, асинхронная инициализация
async function initAnalytics(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (analytics) return;
  
  try {
    const supported = await isSupported();
    if (supported && firebaseConfig.measurementId) {
      analytics = getAnalytics(app);
    }
  } catch (e) {
    console.warn('Firebase Analytics not available:', e);
  }
}

// Инициализируем Analytics при загрузке
if (typeof window !== 'undefined') {
  initAnalytics();
}

// ============================================================================
// ЭКСПОРТЫ
// ============================================================================

// Firebase instances (singleton)
export { app, db, storage, messaging, analytics };
export { getMessagingInstance as getMessagingOrNull };
export default app;

// Re-export Firestore utilities (use these instead of importing from 'firebase/firestore')
export {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch,
  Timestamp,
};
export type { 
  Unsubscribe, 
  DocumentReference, 
  CollectionReference, 
  Query, 
  QuerySnapshot, 
  DocumentSnapshot,
  FieldValue,
  Firestore,
};

// Re-export Storage utilities
export {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
};

// Re-export Messaging utilities
export {
  getToken,
  onMessage,
  deleteToken,
};
