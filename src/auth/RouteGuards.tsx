/**
 * Route Guards - Client-Side Route Protection
 * 
 * Provides React Router v5 compatible route guards for:
 * - Authentication (PrivateRoute)
 * - Role-based access (RoleRoute)
 * - Onboarding gating (OnboardingRoute)
 * 
 * @module auth/RouteGuards
 */

import React, { Suspense } from 'react';
import { Route, Redirect, RouteProps, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from './AuthContextV2';
import { HomeSkeleton } from '../components/Skeleton';
import { pageVariants } from '../ui/motion';
import type { UserRole } from '../services/authServiceV2';

// ============================================================================
// Types
// ============================================================================

interface PrivateRouteProps extends Omit<RouteProps, 'render'> {
  component: React.ComponentType<any>;
  /** Skip onboarding check (for onboarding page itself) */
  skipOnboarding?: boolean;
  /** Required roles for this route */
  requiredRoles?: UserRole[];
  /** Custom redirect path when unauthorized */
  redirectTo?: string;
  /** Disable page transition animation */
  disableAnimation?: boolean;
}

interface LocationState {
  from?: { pathname: string };
  redirect?: string;
}

// ============================================================================
// Private Route - Requires Authentication
// ============================================================================

export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component: Component,
  skipOnboarding = false,
  requiredRoles,
  redirectTo,
  disableAnimation = false,
  ...rest
}) => {
  const { user, loading, needsOnboarding, canAccessCoach, canAccessAdmin } = useAuth();
  const location = useLocation<LocationState>();
  const prefersReduced = useReducedMotion();

  return (
    <Route
      {...rest}
      render={(props) => {
        // Show loading state
        if (loading) {
          return <HomeSkeleton />;
        }

        // Not authenticated - redirect to login
        if (!user) {
          return (
            <Redirect
              to={{
                pathname: redirectTo || '/login',
                state: { from: location, redirect: location.pathname },
              }}
            />
          );
        }

        // Check role requirements
        if (requiredRoles && requiredRoles.length > 0) {
          const hasRequiredRole = requiredRoles.includes(user.role);
          
          if (!hasRequiredRole) {
            // Redirect based on user's actual role
            const defaultPath = user.role === 'admin' 
              ? '/admin'
              : user.role === 'coach' 
                ? '/coach/clients'
                : '/main';
            
            return <Redirect to={redirectTo || defaultPath} />;
          }
        }

        // Check onboarding for clients
        if (!skipOnboarding && needsOnboarding && location.pathname !== '/onboarding') {
          return <Redirect to="/onboarding" />;
        }

        // Render the component with animation
        const content = (
          <Suspense fallback={<HomeSkeleton />}>
            <Component {...props} />
          </Suspense>
        );

        if (disableAnimation || prefersReduced) {
          return content;
        }

        return (
          <motion.div
            key={location.pathname}
            variants={pageVariants(false)}
            initial="initial"
            animate="enter"
            exit="exit"
            className="w-full min-h-screen"
          >
            {content}
          </motion.div>
        );
      }}
    />
  );
};

// ============================================================================
// Role-Specific Routes
// ============================================================================

/**
 * Route that requires client role
 */
export const ClientRoute: React.FC<Omit<PrivateRouteProps, 'requiredRoles'>> = (props) => (
  <PrivateRoute {...props} requiredRoles={['client']} />
);

/**
 * Route that requires coach or admin role
 */
export const CoachRoute: React.FC<Omit<PrivateRouteProps, 'requiredRoles'>> = (props) => (
  <PrivateRoute {...props} requiredRoles={['coach', 'admin']} skipOnboarding />
);

/**
 * Route that requires admin role
 */
export const AdminRoute: React.FC<Omit<PrivateRouteProps, 'requiredRoles'>> = (props) => (
  <PrivateRoute {...props} requiredRoles={['admin']} skipOnboarding />
);

// ============================================================================
// Public Route - Redirect if Authenticated
// ============================================================================

interface PublicRouteProps extends Omit<RouteProps, 'render'> {
  component: React.ComponentType<any>;
  /** Redirect authenticated users to this path */
  redirectAuthenticated?: string;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({
  component: Component,
  redirectAuthenticated,
  ...rest
}) => {
  const { user, loading, getRedirectPath } = useAuth();
  const location = useLocation<LocationState>();
  const prefersReduced = useReducedMotion();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (loading) {
          return <HomeSkeleton />;
        }

        // If user is authenticated and we want to redirect
        if (user && redirectAuthenticated) {
          const destination = location.state?.redirect || redirectAuthenticated || getRedirectPath();
          return <Redirect to={destination} />;
        }

        return (
          <Suspense fallback={<HomeSkeleton />}>
            <motion.div
              key={location.pathname}
              variants={pageVariants(!!prefersReduced)}
              initial="initial"
              animate="enter"
              exit="exit"
              className="w-full min-h-screen"
            >
              <Component {...props} />
            </motion.div>
          </Suspense>
        );
      }}
    />
  );
};

// ============================================================================
// Onboarding Route - For onboarding page only
// ============================================================================

export const OnboardingRoute: React.FC<Omit<PrivateRouteProps, 'skipOnboarding' | 'requiredRoles'>> = ({
  component: Component,
  ...rest
}) => {
  const { user, loading, needsOnboarding } = useAuth();
  const location = useLocation();
  const prefersReduced = useReducedMotion();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (loading) {
          return <HomeSkeleton />;
        }

        // Not authenticated - redirect to login
        if (!user) {
          return <Redirect to="/login" />;
        }

        // If user doesn't need onboarding, redirect to main app
        if (!needsOnboarding) {
          const destination = user.role === 'coach' || user.role === 'admin'
            ? '/coach/clients'
            : '/main';
          return <Redirect to={destination} />;
        }

        return (
          <Suspense fallback={<HomeSkeleton />}>
            <motion.div
              key={location.pathname}
              variants={pageVariants(!!prefersReduced)}
              initial="initial"
              animate="enter"
              exit="exit"
              className="w-full min-h-screen"
            >
              <Component {...props} />
            </motion.div>
          </Suspense>
        );
      }}
    />
  );
};

// ============================================================================
// Role-Based Redirect
// ============================================================================

export const RoleBasedRedirect: React.FC = () => {
  const { user, loading, getRedirectPath } = useAuth();

  if (loading) {
    return <HomeSkeleton />;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Redirect to={getRedirectPath()} />;
};

// ============================================================================
// Guard Components (Render Props Pattern)
// ============================================================================

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredRoles?: UserRole[];
}

/**
 * Guard component that only renders children if authenticated
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback = null,
  requiredRoles,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <>{fallback}</>;
  }

  if (!user) {
    return <>{fallback}</>;
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Guard component that only renders children for specific roles
 */
export const RoleGuard: React.FC<AuthGuardProps & { roles: UserRole[] }> = ({
  children,
  fallback = null,
  roles,
}) => {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PrivateRoute;
