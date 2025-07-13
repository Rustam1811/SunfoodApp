import { initializeApp } from 'firebase/app';
import { addDoc, collection, getDocs, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth }           from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export { app };
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth  = getAuth(app);

export async function bookTable(data: { name: string, time: string }) {
  const docRef = await addDoc(collection(db, 'bookings'), data);
  return docRef.id;
}
export async function getBookings() {
  const querySnapshot = await getDocs(collection(db, 'bookings'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
