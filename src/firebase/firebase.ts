import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAv-NJI4lNoL4Kyb0v65BuxTmWW5tnhvIM",
  authDomain: "sunfood-35bdd.firebaseapp.com",
  projectId: "sunfood-35bdd",
  storageBucket: "sunfood-35bdd.firebasestorage.app",
  messagingSenderId: "1051160275492",
  appId: "1:1051160275492:web:8697d3db4be969304186b1",
  measurementId: "G-533B31P7BY"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();

export const bookTable = async (tableId: number, userId: string) => {
  try {
    await firestore.collection('bookings').add({
      tableId,
      userId,
      status: 'reserved',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Ошибка бронирования:', error);
    return false;
  }
};
