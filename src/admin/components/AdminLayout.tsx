/**
 * Admin Layout - Coach/Admin Panel Shell
 * 
 * Sidebar navigation, header, and content area.
 * 
 * @module admin/components/AdminLayout
 */

import React, { useState } from 'react';
import { NavLink, useHistory, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../auth/AuthContextV2';

// ============================================================================
// Types
// ============================================================================

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: Array<'coach' | 'admin'>;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

// ============================================================================
// Navigation Items
// ============================================================================

const navItems: NavItem[] = [
  {
    label: 'Главная',
    path: '/admin',
    icon: <HomeIcon className="w-5 h-5" />,
  },
  {
    label: 'Клиенты',
    path: '/admin/clients',
    icon: <UserGroupIcon className="w-5 h-5" />,
  },
  {
    label: 'Библиотека упражнений',
    path: '/admin/library/exercises',
    icon: <CubeIcon className="w-5 h-5" />,
  },
  {
    label: 'Настройки',
    path: '/admin/settings',
    icon: <Cog6ToothIcon className="w-5 h-5" />,
    roles: ['admin'],
  },
];

// ============================================================================
// Sidebar
// ============================================================================

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const history = useHistory();

  const handleLogout = async () => {
    await logout();
    history.push('/login');
  };

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    if (isAdmin) return true;
    return item.roles.includes('coach');
  });

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`
          fixed top-0 left-0 h-full w-64 bg-tr-card border-r border-tr-border z-50
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-tr-border">
            <span className="text-lg font-bold text-white">Coach Panel</span>
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-tr-text-muted hover:text-white"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                exact={item.path === '/admin'}
                className="flex items-center gap-3 px-3 py-2.5 rounded-tr-md transition-colors text-tr-text-muted hover:bg-tr-hover hover:text-white"
                activeClassName="bg-tr-accent text-white"
                onClick={onClose}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User info & logout */}
          <div className="p-4 border-t border-tr-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-tr-accent flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-tr-text-muted capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-tr-text-muted hover:text-white hover:bg-tr-hover rounded-tr-md transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

// ============================================================================
// Breadcrumb
// ============================================================================

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);

  const breadcrumbLabels: Record<string, string> = {
    admin: 'Панель',
    clients: 'Клиенты',
    library: 'Библиотека',
    exercises: 'Упражнения',
    plan: 'План тренировок',
    nutrition: 'Питание',
    settings: 'Настройки',
  };

  return (
    <nav className="flex items-center gap-2 text-sm text-tr-text-muted">
      {pathParts.map((part, index) => {
        const isLast = index === pathParts.length - 1;
        const label = breadcrumbLabels[part] || part;

        return (
          <React.Fragment key={part}>
            {index > 0 && <ChevronRightIcon className="w-4 h-4" />}
            <span className={isLast ? 'text-white' : ''}>{label}</span>
          </React.Fragment>
        );
      })}
    </nav>
  );
};

// ============================================================================
// Main Layout
// ============================================================================

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-tr-bg flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-tr-card border-b border-tr-border">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-tr-text-muted hover:text-white"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <span className="text-lg font-bold text-white">Coach Panel</span>
          <div className="w-10" />
        </header>

        {/* Desktop header */}
        <header className="hidden lg:flex items-center justify-between p-4 bg-tr-card border-b border-tr-border">
          <Breadcrumb />
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
