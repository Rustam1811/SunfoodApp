// Minimal reactions service scaffold
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';

export async function addReaction(storyId: string, userId: string, emoji: string) {
  return addDoc(collection(db, 'storyReactions'), {
    storyId,
    userId,
    emoji,
    createdAt: serverTimestamp()
  });
}
