/**
 * Setup Auth Fetch
 * 
 * NOTE: Firebase Auth removed - using simple phone+password auth via Firestore.
 * This file is kept for backwards compatibility but no longer adds auth tokens.
 * Authentication is now handled via session in localStorage.
 * 
 * See src/services/authService.ts for the new auth system.
 */

// No-op - auth tokens no longer needed with simple Firestore auth
export {};
