import React from 'react';
import { NavLink, useLocation, useRouteMatch } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HomeIcon, 
  Squares2X2Icon, 
  PlayCircleIcon, 
  ChartBarIcon, 
  UserCircleIcon 
} from '@heroicons/react/24/solid';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
}

const navItems: NavItem[] = [
  { to: '/home', icon: HomeIcon, label: 'Главная' },
  { to: '/menu', icon: Squares2X2Icon, label: 'Тренировки' },
  { to: '/order', icon: PlayCircleIcon, label: 'Мои занятия' },
  { to: '/card', icon: ChartBarIcon, label: 'Прогресс' },
  { to: '/profile', icon: UserCircleIcon, label: 'Профиль' },
];

const NavItem: React.FC<NavItem> = ({ to, icon: Icon, label }) => {
  const match = useRouteMatch({ path: to, exact: true });
  const isActive = !!match;

  return (
    <NavLink 
      to={to} 
      className="relative flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-300 min-w-0 flex-1 group"
    >
      <Icon 
        className={`w-6 h-6 transition-all duration-300 ${
          isActive ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'
        }`} 
      />
      <span 
        className={`text-xs mt-1.5 transition-all duration-300 ${
          isActive ? 'font-bold text-slate-900' : 'font-medium text-slate-600 group-hover:text-slate-900'
        }`}
      >
        {label}
      </span>
      {isActive && (
        <motion.div
          layoutId="active-nav-indicator"
          className="absolute top-1 h-1 w-8 bg-slate-900 rounded-full shadow-lg"
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}
    </NavLink>
  );
};

export const BottomNavBar: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLogin = location.pathname === '/login';

  if (isAdminRoute || isLogin) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-4">
      <nav className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl px-4 py-3 flex justify-center border border-slate-200/60 max-w-sm">
        <div className="flex justify-around gap-2 w-full">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>
      </nav>
    </div>
  );
};

