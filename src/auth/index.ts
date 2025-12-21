/**
 * Auth Module Barrel Exports
 * 
 * @module auth
 */

// Main context
export { AuthProvider, useAuth } from './AuthContextV2';
export type { default as AuthContextV2 } from './AuthContextV2';

// Route guards
export {
  PrivateRoute,
  PublicRoute,
  ClientRoute,
  CoachRoute,
  AdminRoute,
  OnboardingRoute,
  RoleBasedRedirect,
  AuthGuard,
  RoleGuard,
} from './RouteGuards';

// Legacy exports for compatibility
export { AuthProvider as AuthProviderV2 } from './AuthContextV2';
export { useAuth as useAuthV2 } from './AuthContextV2';
