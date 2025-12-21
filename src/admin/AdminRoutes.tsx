/**
 * Admin Routes - Coach/Admin panel routing
 * 
 * Uses AuthContextV2 with role guards.
 * All routes require coach or admin role.
 * 
 * @module admin/AdminRoutes
 */

import React, { Suspense, lazy } from 'react';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContextV2';
import { AdminLayout } from './components/AdminLayout';
import { LoadingState } from './components/FormComponents';

// ============================================================================
// Lazy-loaded Pages
// ============================================================================

const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const ClientsListPage = lazy(() => import('./pages/ClientsListPage'));
const WorkoutPlanEditorPage = lazy(() => import('./pages/WorkoutPlanEditorPage'));
const NutritionEditorPage = lazy(() => import('./pages/NutritionEditorPage'));
const CoachNotesPage = lazy(() => import('./pages/CoachNotesPage'));
const ExerciseLibraryPage = lazy(() => import('./pages/ExerciseLibraryPage'));

// ============================================================================
// Admin Guard HOC
// ============================================================================

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, loading, canAccessCoach, canAccessAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState message="Проверка доступа..." />;
  }

  if (!user) {
    return (
      <Redirect
        to={{
          pathname: '/admin/login',
          state: { from: location },
        }}
      />
    );
  }

  if (!canAccessCoach && !canAccessAdmin) {
    return (
      <div className="min-h-screen bg-tr-bg flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Доступ запрещён</h1>
          <p className="text-tr-text-muted mb-4">
            Эта страница доступна только тренерам и администраторам.
          </p>
          <a
            href="/main"
            className="text-tr-accent hover:underline"
          >
            Перейти в приложение клиента →
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// ============================================================================
// Admin Routes Component
// ============================================================================

export const AdminRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingState message="Загрузка..." />}>
      <Switch>
        {/* Login - no layout, no guard */}
        <Route exact path="/admin/login">
          <AdminLoginPage />
        </Route>

        {/* Protected routes */}
        <Route path="/admin">
          <AdminGuard>
            <AdminLayout>
              <Suspense fallback={<LoadingState />}>
                <Switch>
                  {/* Dashboard */}
                  <Route exact path="/admin">
                    <AdminDashboardPage />
                  </Route>

                  {/* Clients */}
                  <Route exact path="/admin/clients">
                    <ClientsListPage />
                  </Route>

                  {/* Client Plan Editor */}
                  <Route exact path="/admin/clients/:clientId/plan">
                    <WorkoutPlanEditorPage />
                  </Route>

                  {/* Client Nutrition Editor */}
                  <Route exact path="/admin/clients/:clientId/nutrition">
                    <NutritionEditorPage />
                  </Route>

                  {/* Client Notes */}
                  <Route exact path="/admin/clients/:clientId/notes">
                    <CoachNotesPage />
                  </Route>

                  {/* Exercise Library */}
                  <Route exact path="/admin/library/exercises">
                    <ExerciseLibraryPage />
                  </Route>

                  {/* Fallback */}
                  <Redirect to="/admin" />
                </Switch>
              </Suspense>
            </AdminLayout>
          </AdminGuard>
        </Route>
      </Switch>
    </Suspense>
  );
};

export default AdminRoutes;
