import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();
const FieldValue = firebase.firestore.FieldValue;

const bookTable = async (tableId: number, phone: string): Promise<boolean> => {
  try {
    await firestore.collection('bookings').add({
      tableId,
      phone,
      createdAt: FieldValue.serverTimestamp()
    });
    return true;
  } catch (err) {
    console.error('Ошибка бронирования:', err);
    return false;
  }
};

export { firestore, FieldValue, bookTable };
