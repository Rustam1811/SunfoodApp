/**
 * Admin Panel Barrel Exports
 * 
 * @module admin
 */

// Routes
export { AdminRoutes } from './AdminRoutes';

// Components
export { AdminLayout } from './components/AdminLayout';
export * from './components/FormComponents';

// Pages
export { AdminDashboardPage } from './pages/AdminDashboardPage';
export { AdminLoginPage } from './pages/AdminLoginPage';
export { ClientsListPage } from './pages/ClientsListPage';
export { WorkoutPlanEditorPage } from './pages/WorkoutPlanEditorPage';
export { NutritionEditorPage } from './pages/NutritionEditorPage';
export { CoachNotesPage } from './pages/CoachNotesPage';
export { ExerciseLibraryPage } from './pages/ExerciseLibraryPage';

// Services
export * from './services/adminService';

// Schemas
export * from './schemas';
