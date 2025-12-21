/**
 * Coach Messages Service - Trainer OS
 * 
 * Messages from coach to client:
 * - Instructions
 * - Feedback
 * - Video comments
 * 
 * NO chats, NO voice, NO flood - only "to the point" communication.
 * 
 * @module services/coachMessagesService
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ============================================================================
// Types
// ============================================================================

export type MessageType = 'instruction' | 'feedback' | 'video_comment';

export interface CoachMessage {
  id: string;
  clientId: string;
  coachId: string;
  coachName?: string;
  type: MessageType;
  content: string;
  pinned: boolean;
  videoId?: string;
  timecode?: number;
  read: boolean;
  createdAt: string;
}

export interface CreateMessageData {
  clientId: string;
  coachId: string;
  coachName?: string;
  type: MessageType;
  content: string;
  pinned?: boolean;
  videoId?: string;
  timecode?: number;
}

// ============================================================================
// Constants
// ============================================================================

const MESSAGES_COLLECTION = 'coachMessages';

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Create a new message
 */
export async function createMessage(data: CreateMessageData): Promise<string> {
  const messageData = {
    ...data,
    pinned: data.pinned || false,
    read: false,
    createdAt: new Date().toISOString(),
  };
  
  const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), messageData);
  return docRef.id;
}

/**
 * Send instruction to client
 */
export async function sendInstruction(
  clientId: string,
  coachId: string,
  content: string,
  pinned: boolean = false,
  coachName?: string
): Promise<string> {
  return createMessage({
    clientId,
    coachId,
    coachName,
    type: 'instruction',
    content,
    pinned,
  });
}

/**
 * Send feedback to client
 */
export async function sendFeedback(
  clientId: string,
  coachId: string,
  content: string,
  coachName?: string
): Promise<string> {
  return createMessage({
    clientId,
    coachId,
    coachName,
    type: 'feedback',
    content,
  });
}

/**
 * Send video comment to client
 */
export async function sendVideoComment(
  clientId: string,
  coachId: string,
  videoId: string,
  timecode: number,
  content: string,
  coachName?: string
): Promise<string> {
  return createMessage({
    clientId,
    coachId,
    coachName,
    type: 'video_comment',
    content,
    videoId,
    timecode,
  });
}

/**
 * Get messages for a client
 */
export async function getClientMessages(
  clientId: string,
  limitCount: number = 50
): Promise<CoachMessage[]> {
  try {
    const messagesQuery = query(
      collection(db, MESSAGES_COLLECTION),
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(messagesQuery);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CoachMessage));
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
}

/**
 * Get pinned messages for client (instructions)
 */
export async function getPinnedMessages(clientId: string): Promise<CoachMessage[]> {
  try {
    const messagesQuery = query(
      collection(db, MESSAGES_COLLECTION),
      where('clientId', '==', clientId),
      where('pinned', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(messagesQuery);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CoachMessage));
  } catch (error) {
    console.error('Error getting pinned messages:', error);
    return [];
  }
}

/**
 * Get unread messages count
 */
export async function getUnreadCount(clientId: string): Promise<number> {
  try {
    const messagesQuery = query(
      collection(db, MESSAGES_COLLECTION),
      where('clientId', '==', clientId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(messagesQuery);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

/**
 * Subscribe to client messages (real-time)
 */
export function subscribeClientMessages(
  clientId: string,
  callback: (messages: CoachMessage[]) => void
): () => void {
  const messagesQuery = query(
    collection(db, MESSAGES_COLLECTION),
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CoachMessage));
    callback(messages);
  });
}

/**
 * Subscribe to unread count (real-time)
 */
export function subscribeUnreadCount(
  clientId: string,
  callback: (count: number) => void
): () => void {
  const messagesQuery = query(
    collection(db, MESSAGES_COLLECTION),
    where('clientId', '==', clientId),
    where('read', '==', false)
  );
  
  return onSnapshot(messagesQuery, (snapshot) => {
    callback(snapshot.size);
  });
}

/**
 * Mark message as read
 */
export async function markAsRead(messageId: string): Promise<void> {
  const docRef = doc(db, MESSAGES_COLLECTION, messageId);
  await updateDoc(docRef, { read: true });
}

/**
 * Mark all messages as read for client
 */
export async function markAllAsRead(clientId: string): Promise<void> {
  const messagesQuery = query(
    collection(db, MESSAGES_COLLECTION),
    where('clientId', '==', clientId),
    where('read', '==', false)
  );
  
  const snapshot = await getDocs(messagesQuery);
  
  for (const messageDoc of snapshot.docs) {
    await updateDoc(messageDoc.ref, { read: true });
  }
}

/**
 * Toggle pin status
 */
export async function togglePin(messageId: string, pinned: boolean): Promise<void> {
  const docRef = doc(db, MESSAGES_COLLECTION, messageId);
  await updateDoc(docRef, { pinned });
}

/**
 * Update message content
 */
export async function updateMessage(messageId: string, content: string): Promise<void> {
  const docRef = doc(db, MESSAGES_COLLECTION, messageId);
  await updateDoc(docRef, { content });
}

/**
 * Delete message
 */
export async function deleteMessage(messageId: string): Promise<void> {
  const docRef = doc(db, MESSAGES_COLLECTION, messageId);
  await deleteDoc(docRef);
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Get message type display name
 */
export function getMessageTypeName(type: MessageType): string {
  switch (type) {
    case 'instruction': return 'Инструкция';
    case 'feedback': return 'Обратная связь';
    case 'video_comment': return 'Комментарий к видео';
  }
}

/**
 * Get message type icon
 */
export function getMessageTypeIcon(type: MessageType): string {
  switch (type) {
    case 'instruction': return '📌';
    case 'feedback': return '💬';
    case 'video_comment': return '🎥';
  }
}

/**
 * Format timecode for display
 */
export function formatTimecode(seconds?: number): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Group messages by date
 */
export function groupMessagesByDate(messages: CoachMessage[]): Map<string, CoachMessage[]> {
  const grouped = new Map<string, CoachMessage[]>();
  
  messages.forEach(msg => {
    const date = msg.createdAt.split('T')[0];
    const existing = grouped.get(date) || [];
    existing.push(msg);
    grouped.set(date, existing);
  });
  
  return grouped;
}
