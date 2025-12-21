/**
 * Client Navigation Bar - Bottom navigation for clients
 * 
 * Trainer OS v1 - Graphite + Wine theme
 * 4 tabs: Сегодня | Питание | Тело | Тренер
 * 
 * @module navigation/ClientNavBar
 */

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarDaysIcon,
  FireIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import {
  CalendarDaysIcon as CalendarDaysSolid,
  FireIcon as FireSolid,
  UserCircleIcon as UserCircleSolid,
  ChatBubbleLeftRightIcon as ChatBubbleSolid,
} from '@heroicons/react/24/solid';

// ============================================================================
// Types
// ============================================================================

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconActive: React.ComponentType<{ className?: string }>;
}

// ============================================================================
// Navigation Items
// ============================================================================

const navItems: NavItem[] = [
  {
    path: '/today',
    label: 'Сегодня',
    icon: CalendarDaysIcon,
    iconActive: CalendarDaysSolid,
  },
  {
    path: '/nutrition',
    label: 'Питание',
    icon: FireIcon,
    iconActive: FireSolid,
  },
  {
    path: '/body',
    label: 'Тело',
    icon: UserCircleIcon,
    iconActive: UserCircleSolid,
  },
  {
    path: '/coach',
    label: 'Тренер',
    icon: ChatBubbleLeftRightIcon,
    iconActive: ChatBubbleSolid,
  },
];

// ============================================================================
// Component
// ============================================================================

export const ClientNavBar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-tr-base/95 backdrop-blur-md border-t border-tr-border safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          location.pathname.startsWith(item.path + '/');
          const Icon = isActive ? item.iconActive : item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center flex-1 h-full py-2"
            >
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="clientNavBg"
                    className="absolute -inset-2 rounded-xl"
                    style={{ background: 'rgba(166, 77, 85, 0.15)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon
                  className={`relative w-6 h-6 transition-colors duration-200 ${
                    isActive ? 'text-tr-accent-light' : 'text-tr-text-muted'
                  }`}
                />
              </div>
              <span
                className={`text-xs mt-1 font-semibold transition-colors duration-200 ${
                  isActive ? 'text-tr-accent-light' : 'text-tr-text-muted'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default ClientNavBar;
