import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export type AdminActionType = 'create' | 'update' | 'delete' | 'reorder';
export type AdminCollection = 'entities' | 'flows';

type AdminActionInput = {
  actionType: AdminActionType;
  collection: AdminCollection;
  targetId: string;
  diff?: Record<string, unknown>;
  byUid?: string;
};

export async function logAdminAction(input: AdminActionInput): Promise<void> {
  const payload = {
    ...input,
    createdAt: serverTimestamp(),
  };

  try {
    await addDoc(collection(db, 'admin_actions'), payload);
  } catch (err) {
    console.error('[Admin] Failed to log action:', err);
  }
}
