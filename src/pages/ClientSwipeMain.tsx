/**
 * ClientSwipeMain - Main Client Interface with Swipe Navigation
 *
 * 3-page horizontal swipe shell:
 * - Left: Profile/Check-in
 * - Center: Workouts (default)
 * - Right: Nutrition
 *
 * @module pages/ClientSwipeMain
 */

import React, { useMemo } from 'react';
import { 
  HomeIcon, 
  UserCircleIcon, 
  ChartBarIcon,
} from '@heroicons/react/24/solid';
import { SwipeShell, type SwipePage } from '../components/shell/SwipeShell';
import { AppShell } from '../ui/premium';
import { WorkoutsPage } from './swipe/WorkoutsPage';
import { NutritionPage } from './swipe/NutritionPage';
import { ProfilePage } from './swipe/ProfilePage';

// ============================================================================
// Page Configuration
// ============================================================================

const ClientSwipeMain: React.FC = () => {
  const pages: SwipePage[] = useMemo(
    () => [
      {
        id: 'profile',
        label: 'Profile',
        icon: <UserCircleIcon className="w-4 h-4" />,
        component: <ProfilePage />,
      },
      {
        id: 'workouts',
        label: 'Workouts',
        icon: <HomeIcon className="w-4 h-4" />,
        component: <WorkoutsPage />,
      },
      {
        id: 'nutrition',
        label: 'Nutrition',
        icon: <ChartBarIcon className="w-4 h-4" />,
        component: <NutritionPage />,
      },
    ],
    []
  );

  return (
    <AppShell grain vignette ambientGlow="top">
      <SwipeShell
        pages={pages}
        initialPage={1} // Center = Workouts
        showTabs={true}
        showLabels={false}
        persistKey="client-swipe-page"
        onPageChange={(index, pageId) => {
          // Optional: track page views or update URL
        }}
        className="h-screen"
      />
    </AppShell>
  );
};

export default ClientSwipeMain;
