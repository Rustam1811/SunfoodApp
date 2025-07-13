import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
const COLL = 'categories';
export function listenMenu(callback) {
    return onSnapshot(collection(db, COLL), snap => {
        const cats = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(cats);
    });
}
