import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Switch, Route, Redirect, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { AuthProvider, useAuth } from './auth/AuthContextV2';
import { HomeSkeleton } from './components/Skeleton';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './ui/Toast';
import { pageVariants } from './ui/motion';
import './lib/env';
import './index.css';

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const Onboarding = lazy(() => import('./pages/Onboarding'));

// Trainer OS v2 - Client pages (Drinkitt-style swipeable)
const ClientSwipeMain = lazy(() => import('./pages/ClientSwipeMain'));
const WorkoutExecution = lazy(() => import('./pages/WorkoutExecution'));
const WorkoutSession = lazy(() => import('./pages/WorkoutSession'));

// Legacy client pages (kept for direct access if needed)
const ClientToday = lazy(() => import('./pages/ClientToday'));
const NutritionPage = lazy(() => import('./pages/NutritionPage'));
const BodyPage = lazy(() => import('./pages/BodyPage'));
const CoachPage = lazy(() => import('./pages/CoachPage'));

// Trainer OS v2 - Coach/Admin pages (FULL FEATURED)
const CoachDashboard = lazy(() => import('./pages/coach/CoachDashboard'));
const ClientDetailPageNew = lazy(() => import('./pages/coach/ClientDetailPageNew'));
const WorkoutBuilderPage = lazy(() => import('./pages/coach/WorkoutBuilderPage'));
const SignalsPage = lazy(() => import('./pages/coach/SignalsPage'));
const VideoDetailPage = lazy(() => import('./pages/coach/VideoDetailPage'));

// Bottom navigation - different for client vs coach
import { TrainerNavBar } from './app/navigation/TrainerNavBar';
import { ClientNavBar } from './app/navigation/ClientNavBar';

const initializeFCM = () => import('./services/messaging').then(m => m.initializeFCM());
const createPWAUpdater = () => import('./pwa/pwa-updater').then(m => m.createPWAUpdater);

/**
 * Redirects user based on their role
 */
const RoleBasedRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <HomeSkeleton />;
  if (!user) return <Redirect to="/login" />;
  
  // Coach/Admin → /coach/clients
  if (user.role === 'coach' || user.role === 'admin') {
    return <Redirect to="/coach/clients" />;
  }
  
  // Client → /main (swipeable interface)
  return <Redirect to="/main" />;
};

const PrivateRoute: React.FC<{ component: React.ComponentType<any>; exact?: boolean; path: string; skipOnboarding?: boolean }> = ({ 
  component: Component, 
  skipOnboarding = false,
  ...rest 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const prefersReduced = useReducedMotion();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (loading) return <HomeSkeleton />;
        if (!user) return <Redirect to={{ pathname: '/login', state: { redirect: location.pathname } }} />;
        
        // Admin and coach users skip onboarding - they don't need client profile setup
        const isAdminOrCoach = user.role === 'admin' || user.role === 'coach';
        
        // Check if user needs onboarding (new users without completed profile)
        const needsOnboarding = !skipOnboarding && !isAdminOrCoach && !user.onboardingCompleted && !user.height;
        if (needsOnboarding && location.pathname !== '/onboarding') {
          return <Redirect to="/onboarding" />;
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

const AppContent: React.FC = () => {
  const location = useLocation();
  const prefersReduced = useReducedMotion();
  const { user } = useAuth();

  useEffect(() => {
    createPWAUpdater().then((factory) => {
      const pwaUpdater = factory({ autoReload: true });
      pwaUpdater.init();
      return () => pwaUpdater.destroy();
    });
  }, []);

  useEffect(() => {
    if (!user) return;

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
  }, [user]);
  
  const isOnboarding = location.pathname === '/onboarding';
  const isLogin = location.pathname === '/login';
  const isClientMain = location.pathname === '/main' || location.pathname === '/today' || location.pathname === '/nutrition' || location.pathname === '/body' || location.pathname === '/coach-messages';
  const hideNavigation = isOnboarding || isLogin || isClientMain;
  const isCoachOrAdmin = user?.role === 'coach' || user?.role === 'admin';
  
  return (
    <>
      <main className={`${hideNavigation ? '' : 'pb-24'} overflow-hidden min-h-screen`}>
        <Suspense fallback={<HomeSkeleton />}>
          <Switch location={location} key={location.pathname}>
            <Route exact path="/login" render={() => (
              <motion.div
                key={location.pathname}
                variants={pageVariants(!!prefersReduced)}
                initial="initial"
                animate="enter"
                exit="exit"
                className="w-full"
              >
                <Login />
              </motion.div>
            )} />

            {/* Trainer OS v2 - Client Swipeable Main Screen (Drinkitt style) */}
            <PrivateRoute exact path="/main" component={ClientSwipeMain} />
            <PrivateRoute exact path="/today" component={ClientSwipeMain} />
            <PrivateRoute exact path="/nutrition" component={ClientSwipeMain} />
            <PrivateRoute exact path="/body" component={ClientSwipeMain} />
            <PrivateRoute exact path="/coach-messages" component={ClientSwipeMain} />
            
            {/* Workout execution - separate fullscreen */}
            <PrivateRoute exact path="/workout/:sessionId" component={WorkoutExecution} />
            <PrivateRoute path="/workout-session" component={WorkoutSession} />
            <PrivateRoute exact path="/onboarding" component={Onboarding} skipOnboarding />
            
            {/* Trainer OS v2 - Coach/Admin Dashboard (same for both) */}
            <PrivateRoute exact path="/coach/clients" component={CoachDashboard} />
            <PrivateRoute exact path="/admin" component={CoachDashboard} />
            
            {/* Client detail page with full editing */}
            <PrivateRoute exact path="/coach/client/:clientId" component={ClientDetailPageNew} />
            <PrivateRoute exact path="/coach/client/:clientId/video/:videoId" component={VideoDetailPage} />
            <PrivateRoute exact path="/coach/workout-builder" component={WorkoutBuilderPage} />
            <PrivateRoute exact path="/coach/signals" component={SignalsPage} />
            
            {/* Legacy client routes - redirect to /main */}
            <Route exact path="/programs"><Redirect to="/main" /></Route>
            <Route exact path="/progress"><Redirect to="/main" /></Route>
            <Route exact path="/profile"><Redirect to="/main" /></Route>
            <Route exact path="/coach"><Redirect to="/main" /></Route>
            
            {/* Legacy coach routes - redirect to /coach/clients */}
            <Route exact path="/coach/programs"><Redirect to="/coach/clients" /></Route>
            <Route exact path="/coach/profile"><Redirect to="/coach/clients" /></Route>
            <Route exact path="/coach/clients/:clientId"><Redirect to="/coach/clients" /></Route>
            
            {/* Default route - handled by RoleBasedRedirect */}
            <Route exact path="/" component={RoleBasedRedirect} />
            <Route path="*" component={RoleBasedRedirect} />
          </Switch>
        </Suspense>
      </main>
      {/* Show nav only for coach/admin users (clients use swipe interface) */}
      {!hideNavigation && isCoachOrAdmin && <TrainerNavBar />}
    </>
  );
};

const App: React.FC = () => (
  <ErrorBoundary>
    <BrowserRouter basename="/app">
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen bg-tr-base text-tr-text">
            <AppContent />
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </ErrorBoundary>
);

export default App;