/**
 * Proxy file for backwards compatibility.
 * All imports should use src/lib/firebase directly.
 * @deprecated Use import from './lib/firebase' instead
 */
export { 
  app, 
  db, 
  storage, 
  messaging, 
  analytics, 
  getMessagingOrNull,
  // Re-export Firestore utilities
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
  // Re-export Storage utilities
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  // Re-export Messaging utilities
  getToken,
  onMessage,
  deleteToken,
} from './lib/firebase';
export { default } from './lib/firebase';
export type { 
  Unsubscribe, 
  DocumentReference, 
  CollectionReference, 
  Query, 
  QuerySnapshot, 
  DocumentSnapshot,
  FieldValue,
  Firestore,
} from './lib/firebase';
