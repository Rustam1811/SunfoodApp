import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../src/firebase';
import { Promo } from '../types/promo';

const COLLECTION = 'promos';

/**
 * Создать новую акцию
 */
export async function createPromo(promo: Omit<Promo, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...promo,
    startDate: Timestamp.fromDate(new Date(promo.startDate)),
    endDate: Timestamp.fromDate(new Date(promo.endDate)),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    usageCount: 0
  });
  
  return docRef.id;
}

/**
 * Обновить акцию
 */
export async function updatePromo(id: string, data: Partial<Promo>): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  
  const updateData: any = {
    ...data,
    updatedAt: serverTimestamp()
  };
  
  // Конвертируем даты если они есть
  if (data.startDate) {
    updateData.startDate = Timestamp.fromDate(new Date(data.startDate));
  }
  if (data.endDate) {
    updateData.endDate = Timestamp.fromDate(new Date(data.endDate));
  }
  
  await updateDoc(docRef, updateData);
}

/**
 * Удалить акцию
 */
export async function deletePromo(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Получить все акции
 */
export async function getAllPromos(): Promise<Promo[]> {
  const querySnapshot = await getDocs(
    query(collection(db, COLLECTION), orderBy('priority', 'desc'))
  );
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      startDate: data.startDate?.toDate?.() || data.startDate,
      endDate: data.endDate?.toDate?.() || data.endDate,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    } as Promo;
  });
}

/**
 * Получить активные акции
 */
export async function getActivePromos(): Promise<Promo[]> {
  const now = Timestamp.now();
  
  const querySnapshot = await getDocs(
    query(
      collection(db, COLLECTION),
      where('isActive', '==', true),
      where('startDate', '<=', now),
      where('endDate', '>=', now),
      orderBy('startDate'),
      orderBy('priority', 'desc')
    )
  );
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      startDate: data.startDate?.toDate?.() || data.startDate,
      endDate: data.endDate?.toDate?.() || data.endDate,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    } as Promo;
  });
}

/**
 * Инкрементировать счетчик использования акции
 */
export async function incrementPromoUsage(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  const promoDoc = await getDocs(query(collection(db, COLLECTION), where('__name__', '==', id)));
  
  if (!promoDoc.empty) {
    const currentUsage = promoDoc.docs[0].data().usageCount || 0;
    await updateDoc(docRef, {
      usageCount: currentUsage + 1,
      updatedAt: serverTimestamp()
    });
  }
}
