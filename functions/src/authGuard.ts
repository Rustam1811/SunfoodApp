/**
 * Auth Guard for Firebase Functions
 * 
 * Middleware to verify Firebase Auth ID tokens in API requests.
 * Use this to protect server-side endpoints.
 * 
 * @module functions/lib/authGuard
 */

import * as functions from 'firebase-functions';
import { getAuth } from './admin';
import type { Request, Response } from 'express';

// ============================================================================
// Types
// ============================================================================

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    phone?: string;
    role?: string;
  };
}

export type AuthenticatedHandler = (
  req: AuthenticatedRequest,
  res: Response
) => Promise<void> | void;

// ============================================================================
// Token Verification
// ============================================================================

/**
 * Verify Firebase ID token from request
 */
export async function verifyIdToken(token: string): Promise<{
  valid: boolean;
  uid?: string;
  decodedToken?: any;
  error?: string;
}> {
  try {
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    
    return {
      valid: true,
      uid: decodedToken.uid,
      decodedToken,
    };
  } catch (error: any) {
    return {
      valid: false,
      error: error.code || 'invalid-token',
    };
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) return null;
  
  // Format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  return parts[1];
}

// ============================================================================
// Express Middleware
// ============================================================================

/**
 * Express middleware to verify Firebase Auth token
 */
export function requireAuth(
  handler: AuthenticatedHandler
): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response) => {
    const token = extractToken(req);
    
    if (!token) {
      res.status(401).json({ 
        error: 'unauthorized',
        message: 'No authentication token provided',
      });
      return;
    }
    
    const verification = await verifyIdToken(token);
    
    if (!verification.valid) {
      res.status(401).json({ 
        error: verification.error,
        message: 'Invalid or expired authentication token',
      });
      return;
    }
    
    // Attach user info to request
    const authReq = req as AuthenticatedRequest;
    authReq.user = {
      uid: verification.uid!,
      email: verification.decodedToken?.email,
      phone: verification.decodedToken?.phone_number,
    };
    
    // Call the handler
    await handler(authReq, res);
  };
}

/**
 * Express middleware to optionally verify Firebase Auth token
 * Continues even if no token, but attaches user if token is valid
 */
export function optionalAuth(
  handler: AuthenticatedHandler
): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response) => {
    const token = extractToken(req);
    const authReq = req as AuthenticatedRequest;
    
    if (token) {
      const verification = await verifyIdToken(token);
      
      if (verification.valid) {
        authReq.user = {
          uid: verification.uid!,
          email: verification.decodedToken?.email,
          phone: verification.decodedToken?.phone_number,
        };
      }
    }
    
    await handler(authReq, res);
  };
}

// ============================================================================
// Role-Based Access Control
// ============================================================================

/**
 * Middleware to require specific roles
 */
export function requireRole(
  roles: string[],
  handler: AuthenticatedHandler
): (req: Request, res: Response) => Promise<void> {
  return requireAuth(async (req: AuthenticatedRequest, res: Response) => {
    // Get user role from Firestore
    // Note: This requires fetching the user profile - implement as needed
    // For now, check custom claims if set
    
    const userRole = req.user?.role;
    
    if (userRole && roles.includes(userRole)) {
      await handler(req, res);
    } else {
      res.status(403).json({
        error: 'forbidden',
        message: 'Insufficient permissions',
      });
    }
  });
}

/**
 * Callable function wrapper with auth
 */
export function authenticatedCallable<T, R>(
  handler: (data: T, context: functions.https.CallableContext) => Promise<R>
): functions.HttpsFunction {
  return functions.https.onCall(async (data: T, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Authentication required'
      );
    }
    
    return handler(data, context);
  });
}

/**
 * Callable function wrapper with role check
 */
export function roleRestrictedCallable<T, R>(
  allowedRoles: string[],
  handler: (data: T, context: functions.https.CallableContext) => Promise<R>
): functions.HttpsFunction {
  return functions.https.onCall(async (data: T, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Authentication required'
      );
    }
    
    // Check custom claims for role
    const role = context.auth.token?.role as string | undefined;
    
    if (!role || !allowedRoles.includes(role)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Insufficient permissions'
      );
    }
    
    return handler(data, context);
  });
}
