/**
 * FCM Messaging Service - Push Notifications
 * 
 * Handles Firebase Cloud Messaging for push notifications.
 * 
 * @module services/messaging
 */

import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../lib/firebase';

// VAPID key for web push
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

/**
 * Initialize FCM and request notification permission
 */
export async function initializeFCM(): Promise<string | null> {
  try {
    // Check if messaging is supported
    if (!messaging) {
      console.log('[FCM] Messaging not supported in this browser');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.log('[FCM] Notification permission denied');
      return null;
    }

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    if (token) {
      console.log('[FCM] Token obtained');
      // Here you would typically send this token to your backend
      return token;
    } else {
      console.log('[FCM] No token available');
      return null;
    }
  } catch (error) {
    console.error('[FCM] Error initializing:', error);
    return null;
  }
}

/**
 * Subscribe to foreground messages
 */
export function onForegroundMessage(callback: (payload: unknown) => void): () => void {
  if (!messaging) {
    return () => {};
  }

  return onMessage(messaging, (payload) => {
    console.log('[FCM] Foreground message received:', payload);
    callback(payload);
  });
}

/**
 * Get current FCM token without requesting permission
 */
export async function getCurrentToken(): Promise<string | null> {
  try {
    if (!messaging) {
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    return token || null;
  } catch (error) {
    console.error('[FCM] Error getting token:', error);
    return null;
  }
}
