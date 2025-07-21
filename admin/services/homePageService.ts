import { db } from "../../src/firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  Unsubscribe,
} from "firebase/firestore";
import { StoryPack, Promotion, CuratedItem } from "../types/homePageTypes";

const COLLECTIONS = {
  storyPacks: "storyPacks",
  promotions: "promotions",
  curatedItems: "curatedItems",
} as const;

// Story Packs
export const listenStoryPacks = (
  callback: (packs: StoryPack[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, COLLECTIONS.storyPacks),
    orderBy("order", "asc")
  );
  
  return onSnapshot(q, (snapshot) => {
    const packs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as StoryPack[];
    callback(packs);
  });
};

export const addStoryPack = async (data: Omit<StoryPack, "id">) => {
  return await addDoc(collection(db, COLLECTIONS.storyPacks), {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

export const updateStoryPack = async (id: string, data: Partial<StoryPack>) => {
  return await updateDoc(doc(db, COLLECTIONS.storyPacks, id), {
    ...data,
    updatedAt: new Date(),
  });
};

export const deleteStoryPack = async (id: string) => {
  return await deleteDoc(doc(db, COLLECTIONS.storyPacks, id));
};

// Promotions
export const listenPromotions = (
  callback: (promotions: Promotion[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, COLLECTIONS.promotions),
    orderBy("order", "asc")
  );
  
  return onSnapshot(q, (snapshot) => {
    const promotions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Promotion[];
    callback(promotions);
  });
};

export const addPromotion = async (data: Omit<Promotion, "id">) => {
  return await addDoc(collection(db, COLLECTIONS.promotions), {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

export const updatePromotion = async (id: string, data: Partial<Promotion>) => {
  return await updateDoc(doc(db, COLLECTIONS.promotions, id), {
    ...data,
    updatedAt: new Date(),
  });
};

export const deletePromotion = async (id: string) => {
  return await deleteDoc(doc(db, COLLECTIONS.promotions, id));
};

// Curated Items
export const listenCuratedItems = (
  callback: (items: CuratedItem[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, COLLECTIONS.curatedItems),
    orderBy("order", "asc")
  );
  
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CuratedItem[];
    callback(items);
  });
};

export const addCuratedItem = async (data: Omit<CuratedItem, "id">) => {
  return await addDoc(collection(db, COLLECTIONS.curatedItems), {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

export const updateCuratedItem = async (id: string, data: Partial<CuratedItem>) => {
  return await updateDoc(doc(db, COLLECTIONS.curatedItems, id), {
    ...data,
    updatedAt: new Date(),
  });
};

export const deleteCuratedItem = async (id: string) => {
  return await deleteDoc(doc(db, COLLECTIONS.curatedItems, id));
};
