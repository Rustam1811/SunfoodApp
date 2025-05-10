import { db } from '../firebase';
import {
  collection,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { DrinkCategoryLocal } from '../../admin/types/types';

const COLL = 'categories';

export function listenMenu(callback: (cats: DrinkCategoryLocal[]) => void): Unsubscribe {
  return onSnapshot(collection(db, COLL), snap => {
    const cats = snap.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<DrinkCategoryLocal, 'id'>)
    }));
    callback(cats);
  });
}
