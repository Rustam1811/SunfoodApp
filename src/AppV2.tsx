/**
 * App V2 - Updated Application Root with V2 Auth
 * 
 * Uses the new Firebase Auth-based authentication system.
 * Rename this to App.tsx to use the new auth system.
 * 
 * @module AppV2
 */

import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Switch, Route, Redirect, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { AuthProvider, useAuth } from './auth/AuthContextV2';
import { 
  PrivateRoute, 
  PublicRoute, 
  CoachRoute, 
  AdminRoute,
  OnboardingRoute,
  RoleBasedRedirect,
} from './auth/RouteGuards';
import { HomeSkeleton } from './components/Skeleton';
import { ErrorBoundary } from './components/ErrorBoundary';
import { pageVariants } from './ui/motion';
import './lib/env';
import './index.css';

// ============================================================================
// Lazy Loaded Pages
// ============================================================================

// Auth pages (V2)
const LoginV2 = lazy(() => import('./pages/LoginV2'));
const OnboardingV2 = lazy(() => import('./pages/OnboardingV2'));

// Trainer OS v2 - Client pages (Drinkitt-style swipeable)
const ClientSwipeMain = lazy(() => import('./pages/ClientSwipeMain'));
const WorkoutExecution = lazy(() => import('./pages/WorkoutExecution'));
const WorkoutSession = lazy(() => import('./pages/WorkoutSession'));

// Legacy client pages (kept for direct access if needed)
const ClientToday = lazy(() => import('./pages/ClientToday'));
const NutritionPage = lazy(() => import('./pages/NutritionPage'));
const BodyPage = lazy(() => import('./pages/BodyPage'));
const CoachPage = lazy(() => import('./pages/CoachPage'));

// Trainer OS v2 - Coach pages
const CoachClientsPage = lazy(() => import('./pages/coach/CoachClientsPage'));
const ClientProfilePage = lazy(() => import('./pages/coach/ClientProfilePage'));
const WorkoutBuilderPage = lazy(() => import('./pages/coach/WorkoutBuilderPage'));
const SignalsPage = lazy(() => import('./pages/coach/SignalsPage'));
const VideoDetailPage = lazy(() => import('./pages/coach/VideoDetailPage'));

// Trainer OS v2 - Admin pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));

// Navigation
import { TrainerNavBar } from './app/navigation/TrainerNavBar';
import { ClientNavBar } from './app/navigation/ClientNavBar';

// ============================================================================
// PWA & FCM Initialization
// ============================================================================

const initializeFCM = () => import('./services/messaging').then(m => m.initializeFCM());
const createPWAUpdater = () => import('./pwa/pwa-updater').then(m => m.createPWAUpdater);

// ============================================================================
// App Content
// ============================================================================

const AppContent: React.FC = () => {
  const location = useLocation();
  const prefersReduced = useReducedMotion();
  const { user, isAuthenticated, canAccessCoach, canAccessAdmin } = useAuth();

  // PWA Updater
  useEffect(() => {
    createPWAUpdater().then((factory) => {
      const pwaUpdater = factory({ autoReload: true });
      pwaUpdater.init();
      return () => pwaUpdater.destroy();
    });
  }, []);

  // FCM Initialization
  useEffect(() => {
    if (!isAuthenticated) return;

    const hasAskedForNotifications = localStorage.getItem('notifications-asked');
    
    if (!hasAskedForNotifications && 'Notification' in window) {
      setTimeout(() => {
        initializeFCM().then(() => {
          localStorage.setItem('notifications-asked', 'true');
        });
      }, 3000);
    } else if (hasAskedForNotifications) {
      initializeFCM();
    }
  }, [isAuthenticated]);
  
  // Navigation visibility logic
  const isOnboarding = location.pathname === '/onboarding';
  const isLogin = location.pathname === '/login';
  const isClientMain = location.pathname === '/main' || 
                       location.pathname === '/today' || 
                       location.pathname === '/nutrition' || 
                       location.pathname === '/body' || 
                       location.pathname === '/coach-messages';
  const isWorkout = location.pathname.startsWith('/workout');
  const hideNavigation = isOnboarding || isLogin || isClientMain || isWorkout;
  const showCoachNav = !hideNavigation && (canAccessCoach || canAccessAdmin);
  
  return (
    <>
      <main className={`${hideNavigation ? '' : 'pb-24'} overflow-hidden min-h-screen`}>
        <Suspense fallback={<HomeSkeleton />}>
          <Switch location={location}>
            {/* Public routes */}
            <PublicRoute 
              exact 
              path="/login" 
              component={LoginV2} 
              redirectAuthenticated="/main"
            />

            {/* Onboarding (requires auth but not completed onboarding) */}
            <OnboardingRoute 
              exact 
              path="/onboarding" 
              component={OnboardingV2} 
            />

            {/* Client routes */}
            <PrivateRoute exact path="/main" component={ClientSwipeMain} />
            <PrivateRoute exact path="/today" component={ClientSwipeMain} />
            <PrivateRoute exact path="/nutrition" component={ClientSwipeMain} />
            <PrivateRoute exact path="/body" component={ClientSwipeMain} />
            <PrivateRoute exact path="/coach-messages" component={ClientSwipeMain} />
            
            {/* Workout execution - fullscreen */}
            <PrivateRoute exact path="/workout/:sessionId" component={WorkoutExecution} />
            <PrivateRoute path="/workout-session" component={WorkoutSession} />
            
            {/* Coach routes (requires coach or admin role) */}
            <CoachRoute exact path="/coach/clients" component={CoachClientsPage} />
            <CoachRoute exact path="/coach/client/:clientId" component={ClientProfilePage} />
            <CoachRoute exact path="/coach/client/:clientId/video/:videoId" component={VideoDetailPage} />
            <CoachRoute exact path="/coach/workout-builder" component={WorkoutBuilderPage} />
            <CoachRoute exact path="/coach/signals" component={SignalsPage} />
            
            {/* Admin routes (requires admin role) */}
            <AdminRoute exact path="/admin" component={AdminDashboardPage} />
            
            {/* Legacy redirects */}
            <Route exact path="/programs"><Redirect to="/main" /></Route>
            <Route exact path="/progress"><Redirect to="/main" /></Route>
            <Route exact path="/profile"><Redirect to="/main" /></Route>
            <Route exact path="/coach"><Redirect to="/coach/clients" /></Route>
            
            {/* Default route */}
            <Route exact path="/" component={RoleBasedRedirect} />
            <Route path="*" component={RoleBasedRedirect} />
          </Switch>
        </Suspense>
      </main>
      
      {/* Navigation */}
      {showCoachNav && <TrainerNavBar />}
    </>
  );
};

// ============================================================================
// App Root
// ============================================================================

const AppV2: React.FC = () => (
  <ErrorBoundary>
    <BrowserRouter basename="/app">
      <AuthProvider>
        <div className="min-h-screen bg-tr-base text-tr-text">
          <AppContent />
        </div>
      </AuthProvider>
    </BrowserRouter>
  </ErrorBoundary>
);

export default AppV2;
