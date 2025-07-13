import { db } from "../../src/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { DrinkCategoryLocal } from "../types/types";

const COLL = "categories";

export const listenCategories = (
  callback: (cats: DrinkCategoryLocal[]) => void
): Unsubscribe => {
  const colRef = collection(db, COLL);
  return onSnapshot(colRef, snap => {
    const cats = snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<DrinkCategoryLocal, "id">),
    }));
    callback(cats);
  });
};

export const addCategory = (data: Omit<DrinkCategoryLocal, "id">) =>
  addDoc(collection(db, COLL), data);

export const updateCategory = (id: string, data: Partial<DrinkCategoryLocal>) =>
  updateDoc(doc(db, COLL, id), data);

export const deleteCategory = (id: string) =>
  deleteDoc(doc(db, COLL, id));
