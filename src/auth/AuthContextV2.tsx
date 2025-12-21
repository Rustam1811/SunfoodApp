/**
 * Auth Context V2 - Production-Ready Authentication Provider
 * 
 * Uses Firebase Auth with phone-as-email pattern.
 * Provides role-based access control and onboarding gating.
 * 
 * @module auth/AuthContextV2
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  login as authLogin,
  logout as authLogout,
  getUserProfile,
  updateUserProfile,
  completeOnboarding as authCompleteOnboarding,
  subscribeToAuthState,
  needsOnboarding,
  canAccessCoachFeatures,
  canAccessAdminFeatures,
  getRedirectPath,
  getSession,
  type UserProfile,
  type OnboardingData,
  type UserRole,
} from '../services/authServiceV2';

// ============================================================================
// Types
// ============================================================================

interface AuthContextType {
  // State
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // User status
  isNewUser: boolean;
  needsOnboarding: boolean;
  
  // Role checks
  isClient: boolean;
  isCoach: boolean;
  isAdmin: boolean;
  canAccessCoach: boolean;
  canAccessAdmin: boolean;
  
  // Actions
  login: (phone: string, password: string) => Promise<{
    success: boolean;
    error?: string;
    redirectTo?: string;
  }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  refreshUser: () => Promise<void>;
  
  // Helpers
  getRedirectPath: () => string;
}

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ============================================================================
// Provider
// ============================================================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  // Subscribe to auth state changes - single source of truth
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((profile, isLoading) => {
      setUser(profile);
      setLoading(isLoading);
    });

    return () => unsubscribe();
  }, []);

  // Login handler
  const login = useCallback(async (phone: string, password: string) => {
    setLoading(true);
    try {
      const result = await authLogin(phone, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        setIsNewUser(result.isNewUser || false);
        
        const redirectTo = getRedirectPath(result.user);
        return { success: true, redirectTo };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Произошла ошибка. Попробуйте снова.' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout handler
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authLogout();
      setUser(null);
      setIsNewUser(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update profile handler
  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!user) return;
    
    await updateUserProfile(user.id, data);
    setUser((prev) => prev ? { ...prev, ...data } : null);
  }, [user]);

  // Complete onboarding handler
  const completeOnboarding = useCallback(async (data: OnboardingData) => {
    if (!user) return;
    
    const updatedUser = await authCompleteOnboarding(user.id, data);
    setUser(updatedUser);
    setIsNewUser(false);
  }, [user]);

  // Refresh user data from Firestore
  const refreshUser = useCallback(async () => {
    if (!user) return;
    
    const freshUser = await getUserProfile(user.id);
    if (freshUser) {
      setUser(freshUser);
    }
  }, [user]);

  // Get redirect path helper
  const getRedirect = useCallback(() => {
    return getRedirectPath(user);
  }, [user]);

  // Memoized context value
  const value = useMemo<AuthContextType>(() => ({
    // State
    user,
    loading,
    isAuthenticated: !!user,
    
    // User status
    isNewUser,
    needsOnboarding: needsOnboarding(user),
    
    // Role checks
    isClient: user?.role === 'client',
    isCoach: user?.role === 'coach',
    isAdmin: user?.role === 'admin',
    canAccessCoach: canAccessCoachFeatures(user),
    canAccessAdmin: canAccessAdminFeatures(user),
    
    // Actions
    login,
    logout,
    updateProfile,
    completeOnboarding,
    refreshUser,
    
    // Helpers
    getRedirectPath: getRedirect,
  }), [
    user,
    loading,
    isNewUser,
    login,
    logout,
    updateProfile,
    completeOnboarding,
    refreshUser,
    getRedirect,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================================
// Route Guards (Higher-Order Components)
// ============================================================================

interface WithAuthOptions {
  requiredRoles?: UserRole[];
  requireOnboarding?: boolean;
  redirectTo?: string;
}

/**
 * HOC to protect routes with authentication
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
): React.FC<P> {
  const { requiredRoles, requireOnboarding = true, redirectTo = '/login' } = options;
  
  return function AuthenticatedComponent(props: P) {
    const { user, loading, needsOnboarding: userNeedsOnboarding } = useAuth();
    
    if (loading) {
      return null; // Or a loading spinner
    }
    
    if (!user) {
      // Redirect to login
      window.location.href = redirectTo;
      return null;
    }
    
    // Check role requirements
    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(user.role)) {
        // Unauthorized - redirect to appropriate page
        window.location.href = getRedirectPath(user);
        return null;
      }
    }
    
    // Check onboarding requirement
    if (requireOnboarding && userNeedsOnboarding) {
      window.location.href = '/onboarding';
      return null;
    }
    
    return <Component {...props} />;
  };
}

/**
 * HOC to protect coach-only routes
 */
export function withCoachAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return withAuth(Component, {
    requiredRoles: ['coach', 'admin'],
    requireOnboarding: false,
  });
}

/**
 * HOC to protect admin-only routes
 */
export function withAdminAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return withAuth(Component, {
    requiredRoles: ['admin'],
    requireOnboarding: false,
  });
}

// ============================================================================
// Custom Hooks
// ============================================================================

/**
 * Hook to check if user has required role
 */
export function useRequireRole(requiredRoles: UserRole[]): {
  hasAccess: boolean;
  loading: boolean;
} {
  const { user, loading } = useAuth();
  
  const hasAccess = useMemo(() => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  }, [user, requiredRoles]);
  
  return { hasAccess, loading };
}

/**
 * Hook to get current user with type narrowing
 */
export function useCurrentUser(): UserProfile | null {
  const { user } = useAuth();
  return user;
}

/**
 * Hook to check authentication status
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

export default AuthProvider;
