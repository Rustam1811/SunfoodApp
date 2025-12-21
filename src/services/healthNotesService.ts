/**
 * Health Notes Service - Trainer OS
 * 
 * Manages client health information:
 * - Injuries
 * - Limitations  
 * - Doctor notes
 * 
 * Only coach can write, client sees read-only.
 * 
 * @module services/healthNotesService
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
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// ============================================================================
// Types
// ============================================================================

export type HealthNoteType = 'injury' | 'limitation' | 'medical' | 'general';
export type Severity = 'low' | 'medium' | 'high';

export interface HealthNote {
  id: string;
  clientId: string;
  coachId: string;
  type: HealthNoteType;
  title: string;
  content: string;
  severity?: Severity;
  activeUntil?: string; // ISO date
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHealthNoteData {
  clientId: string;
  coachId: string;
  type: HealthNoteType;
  title: string;
  content: string;
  severity?: Severity;
  activeUntil?: string;
}

// ============================================================================
// Constants
// ============================================================================

const NOTES_COLLECTION = 'healthNotes';

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Create a new health note
 */
export async function createHealthNote(data: CreateHealthNoteData): Promise<string> {
  const now = new Date().toISOString();
  
  const noteData = {
    ...data,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
  
  const docRef = await addDoc(collection(db, NOTES_COLLECTION), noteData);
  return docRef.id;
}

/**
 * Get all health notes for a client
 */
export async function getClientHealthNotes(clientId: string): Promise<HealthNote[]> {
  try {
    const notesQuery = query(
      collection(db, NOTES_COLLECTION),
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(notesQuery);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as HealthNote));
  } catch (error) {
    console.error('Error getting health notes:', error);
    return [];
  }
}

/**
 * Get active health notes only
 */
export async function getActiveHealthNotes(clientId: string): Promise<HealthNote[]> {
  const allNotes = await getClientHealthNotes(clientId);
  const today = new Date().toISOString().split('T')[0];
  
  return allNotes.filter(note => {
    if (!note.isActive) return false;
    if (note.activeUntil && note.activeUntil < today) return false;
    return true;
  });
}

/**
 * Get notes by type
 */
export async function getHealthNotesByType(
  clientId: string, 
  type: HealthNoteType
): Promise<HealthNote[]> {
  try {
    const notesQuery = query(
      collection(db, NOTES_COLLECTION),
      where('clientId', '==', clientId),
      where('type', '==', type),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(notesQuery);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as HealthNote));
  } catch (error) {
    console.error('Error getting health notes by type:', error);
    return [];
  }
}

/**
 * Subscribe to client health notes (real-time)
 */
export function subscribeHealthNotes(
  clientId: string,
  callback: (notes: HealthNote[]) => void
): () => void {
  const notesQuery = query(
    collection(db, NOTES_COLLECTION),
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(notesQuery, (snapshot) => {
    const notes = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as HealthNote));
    callback(notes);
  });
}

/**
 * Update health note
 */
export async function updateHealthNote(
  noteId: string,
  data: Partial<Pick<HealthNote, 'title' | 'content' | 'severity' | 'activeUntil' | 'isActive' | 'type'>>
): Promise<void> {
  const docRef = doc(db, NOTES_COLLECTION, noteId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Deactivate health note (soft delete)
 */
export async function deactivateHealthNote(noteId: string): Promise<void> {
  const docRef = doc(db, NOTES_COLLECTION, noteId);
  await updateDoc(docRef, {
    isActive: false,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete health note permanently
 */
export async function deleteHealthNote(noteId: string): Promise<void> {
  const docRef = doc(db, NOTES_COLLECTION, noteId);
  await deleteDoc(docRef);
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Get note type display name
 */
export function getNoteTypeName(type: HealthNoteType): string {
  switch (type) {
    case 'injury': return 'Травма';
    case 'limitation': return 'Ограничение';
    case 'medical': return 'Медицинская запись';
    case 'general': return 'Общая заметка';
  }
}

/**
 * Get severity display name
 */
export function getSeverityName(severity?: Severity): string {
  switch (severity) {
    case 'high': return 'Высокая';
    case 'medium': return 'Средняя';
    case 'low': return 'Низкая';
    default: return '—';
  }
}

/**
 * Get severity color class
 */
export function getSeverityColor(severity?: Severity): string {
  switch (severity) {
    case 'high': return 'text-red-500';
    case 'medium': return 'text-yellow-500';
    case 'low': return 'text-green-500';
    default: return 'text-gray-500';
  }
}

/**
 * Get note type icon
 */
export function getNoteTypeIcon(type: HealthNoteType): string {
  switch (type) {
    case 'injury': return '🩹';
    case 'limitation': return '⚠️';
    case 'medical': return '🏥';
    case 'general': return '📝';
  }
}

/**
 * Check if note is expired
 */
export function isNoteExpired(note: HealthNote): boolean {
  if (!note.activeUntil) return false;
  const today = new Date().toISOString().split('T')[0];
  return note.activeUntil < today;
}

/**
 * Group notes by type
 */
export function groupNotesByType(notes: HealthNote[]): Record<HealthNoteType, HealthNote[]> {
  const grouped: Record<HealthNoteType, HealthNote[]> = {
    injury: [],
    limitation: [],
    medical: [],
    general: [],
  };
  
  notes.forEach(note => {
    grouped[note.type].push(note);
  });
  
  return grouped;
}
