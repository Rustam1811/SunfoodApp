/**
 * Trainer OS Navigation Bar
 * 
 * Bottom navigation for the new graphite/wine theme.
 * Shows different tabs based on user role (client vs coach).
 * 
 * @module navigation/TrainerNavBar
 */

import React from 'react';
import { NavLink, useLocation, useRouteMatch } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UserGroupIcon,
  BellAlertIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/solid';
import { useAuth } from '../../auth/AuthContextV2';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
}

// Coach navigation items - TRAINER OS v2
// Clients - signals - workout builder
const coachNavItems: NavItem[] = [
  { to: '/coach/clients', icon: UserGroupIcon, label: 'Клиенты' },
  { to: '/coach/signals', icon: BellAlertIcon, label: 'Сигналы' },
  { to: '/coach/workout-builder', icon: WrenchScrewdriverIcon, label: 'Создать' },
];

const NavItemComponent: React.FC<NavItem> = ({ to, icon: Icon, label }) => {
  const match = useRouteMatch({ path: to, exact: to === '/coach/clients' });
  const isActive = !!match;

  return (
    <NavLink 
      to={to} 
      className="relative flex flex-col items-center justify-center py-2 px-3 rounded-tr-md transition-all duration-200 min-w-0 flex-1"
    >
      <Icon 
        className={`w-6 h-6 transition-colors duration-200 ${
          isActive ? 'text-tr-accent' : 'text-tr-text-muted'
        }`} 
      />
      <span 
        className={`text-[10px] mt-1 transition-colors duration-200 ${
          isActive ? 'font-semibold text-tr-accent' : 'font-medium text-tr-text-muted'
        }`}
      >
        {label}
      </span>
      {isActive && (
        <motion.div
          layoutId="trainer-nav-indicator"
          className="absolute -top-1 h-0.5 w-8 bg-tr-accent rounded-full"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
    </NavLink>
  );
};

export const TrainerNavBar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // TRAINER OS v1: No bottom navigation for clients - context-driven UI
  // Only show navigation for coach/admin users
  const isCoach = user?.role === 'coach' || user?.role === 'admin';
  if (!isCoach) return null;
  
  // Hide on certain routes
  const hideOnRoutes = ['/login', '/onboarding', '/admin'];
  const shouldHide = hideOnRoutes.some(route => location.pathname.startsWith(route));
  
  if (shouldHide) return null;

  const navItems = coachNavItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 pointer-events-none">
      <nav className="bg-tr-card/95 backdrop-blur-lg rounded-tr-lg border border-tr-border shadow-lg max-w-md mx-auto pointer-events-auto">
        <div className="flex justify-around py-1">
          {navItems.map((item) => (
            <NavItemComponent key={item.to} {...item} />
          ))}
        </div>
        {/* Safe area for iOS */}
        <div className="h-safe-area-inset-bottom" />
      </nav>
    </div>
  );
};

export default TrainerNavBar;
