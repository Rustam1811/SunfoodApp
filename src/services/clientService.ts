/**
 * Client Service - Manage clients for trainers
 * 
 * CRUD operations for trainer's client management.
 * Clients are users with role='client' assigned to a trainer.
 * 
 * @module services/clientService
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { UserGoal, UserLevel } from './authService';

// ============================================================================
// Types
// ============================================================================

export interface ClientInfo {
  id: string;
  phone: string;
  password: string; // Visible to trainer
  name: string;
  avatar?: string;
  
  // Physical profile
  height?: number;
  weight?: number;
  targetWeight?: number;
  goal?: UserGoal;
  level?: UserLevel;
  
  // Trainer relationship
  trainerId: string;
  weeklyGoal: number;
  
  // Stats
  totalWorkouts: number;
  streak: number;
  lastWorkoutDate?: string;
  
  // Status
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientData {
  phone: string;
  password: string;
  name: string;
  trainerId: string;
  height?: number;
  weight?: number;
  targetWeight?: number;
  goal?: UserGoal;
  level?: UserLevel;
  weeklyGoal?: number;
}

export interface UpdateClientData {
  name?: string;
  phone?: string;
  password?: string;
  height?: number;
  weight?: number;
  targetWeight?: number;
  goal?: UserGoal;
  level?: UserLevel;
  weeklyGoal?: number;
  isActive?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const USERS_COLLECTION = 'users';

// ============================================================================
// Read Operations
// ============================================================================

/**
 * Get all clients for a trainer
 * Note: For now, returns ALL clients (role='client')
 * In future: filter by trainerId assignment
 */
export async function getTrainerClients(_trainerId: string): Promise<ClientInfo[]> {
  try {
    // Get all clients - no complex index needed
    const clientsQuery = query(
      collection(db, USERS_COLLECTION),
      where('role', '==', 'client')
    );
    
    const snapshot = await getDocs(clientsQuery);
    
    const clients = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        phone: data.phone || '',
        password: data.password || '',
        name: data.name || data.displayName || 'Без имени',
        avatar: data.avatar || data.photoURL,
        height: data.height,
        weight: data.weight,
        targetWeight: data.targetWeight,
        goal: data.goal,
        level: data.level,
        trainerId: data.trainerId,
        weeklyGoal: data.weeklyGoal || 3,
        totalWorkouts: data.totalWorkouts || 0,
        streak: data.streak || 0,
        lastWorkoutDate: data.lastWorkoutDate,
        isActive: data.isActive !== false,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as ClientInfo;
    });
    
    // Sort by createdAt in JS (no index needed)
    return clients.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  } catch {
    return [];
  }
}

/**
 * Subscribe to trainer's clients (real-time)
 */
export function subscribeToTrainerClients(
  trainerId: string,
  callback: (clients: ClientInfo[]) => void
): () => void {
  // Get all clients - no trainerId filter for now
  const clientsQuery = query(
    collection(db, USERS_COLLECTION),
    where('role', '==', 'client')
  );
  
  return onSnapshot(clientsQuery, (snapshot) => {
    const clients = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        phone: data.phone || '',
        password: data.password || '',
        name: data.name || '',
        avatar: data.avatar,
        height: data.height,
        weight: data.weight,
        targetWeight: data.targetWeight,
        goal: data.goal,
        level: data.level,
        trainerId: data.trainerId,
        weeklyGoal: data.weeklyGoal || 3,
        totalWorkouts: data.totalWorkouts || 0,
        streak: data.streak || 0,
        lastWorkoutDate: data.lastWorkoutDate,
        isActive: data.isActive !== false,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as ClientInfo;
    });
    
    // Sort by creation date
    clients.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    callback(clients);
  });
}

/**
 * Get single client by ID
 */
export async function getClientById(clientId: string): Promise<ClientInfo | null> {
  try {
    const clientDoc = await getDoc(doc(db, USERS_COLLECTION, clientId));
    
    if (!clientDoc.exists()) {
      return null;
    }
    
    const data = clientDoc.data();
    return {
      id: clientDoc.id,
      phone: data.phone || '',
      password: data.password || '',
      name: data.name || '',
      avatar: data.avatar,
      height: data.height,
      weight: data.weight,
      targetWeight: data.targetWeight,
      goal: data.goal,
      level: data.level,
      trainerId: data.trainerId,
      weeklyGoal: data.weeklyGoal || 3,
      totalWorkouts: data.totalWorkouts || 0,
      streak: data.streak || 0,
      lastWorkoutDate: data.lastWorkoutDate,
      isActive: data.isActive !== false,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as ClientInfo;
  } catch {
    return null;
  }
}

// ============================================================================
// Write Operations
// ============================================================================

/**
 * Create new client
 */
export async function createClient(data: CreateClientData): Promise<ClientInfo> {
  const clientId = 'client_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  const now = new Date().toISOString();
  
  const clientData = {
    phone: data.phone,
    password: data.password,
    name: data.name,
    role: 'client' as const,
    trainerId: data.trainerId,
    height: data.height,
    weight: data.weight,
    targetWeight: data.targetWeight,
    goal: data.goal,
    level: data.level || 'beginner',
    weeklyGoal: data.weeklyGoal || 3,
    totalWorkouts: 0,
    points: 0,
    streak: 0,
    isActive: true,
    onboardingCompleted: true, // Trainer creates, no need for onboarding
    createdAt: now,
    updatedAt: now,
  };
  
  await setDoc(doc(db, USERS_COLLECTION, clientId), clientData);
  
  return {
    id: clientId,
    ...clientData,
  } as ClientInfo;
}

/**
 * Update client
 */
export async function updateClient(
  clientId: string,
  data: UpdateClientData
): Promise<void> {
  await updateDoc(doc(db, USERS_COLLECTION, clientId), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete client (soft delete - set isActive to false)
 */
export async function deactivateClient(clientId: string): Promise<void> {
  await updateDoc(doc(db, USERS_COLLECTION, clientId), {
    isActive: false,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Permanently delete client
 */
export async function deleteClient(clientId: string): Promise<void> {
  await deleteDoc(doc(db, USERS_COLLECTION, clientId));
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Check if phone number is already registered
 */
export async function isPhoneRegistered(phone: string): Promise<boolean> {
  const usersQuery = query(
    collection(db, USERS_COLLECTION),
    where('phone', '==', phone)
  );
  
  const snapshot = await getDocs(usersQuery);
  return !snapshot.empty;
}

/**
 * Generate random password
 */
export function generatePassword(length: number = 6): string {
  const chars = '0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ============================================================================
// Type Aliases for Trainer OS v2
// ============================================================================

/**
 * Client type alias for pages
 */
export interface Client {
  id: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  phone?: string;
  lastWorkout?: Date | string;
}

/**
 * Get coach clients - alias for getTrainerClients
 */
export async function getCoachClients(coachId: string): Promise<Client[]> {
  const clients = await getTrainerClients(coachId);
  return clients.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.phone, // Use phone as email fallback
    avatarUrl: c.avatar,
    phone: c.phone,
    lastWorkout: c.lastWorkoutDate,
  }));
}
