import React from 'react';
import { motion } from 'framer-motion';
import { 
  HomeIcon, 
  ChartBarIcon, 
  CogIcon, 
  ClipboardDocumentListIcon,
  UserGroupIcon,
  GiftIcon,
  TrophyIcon,
  MegaphoneIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { UserRole, getUserRole, getCurrentUserId } from '../../src/utils/userRoles';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  roles: UserRole[];
}

interface MobileAdminNavigationProps {
  currentRoute: string;
  onRouteChange: (route: string) => void;
}

/**
 * Конфигурация навигации для разных ролей
 */
const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Главная',
    icon: HomeIcon,
    route: 'dashboard',
    roles: [UserRole.ADMIN, UserRole.BARISTA]
  },
  {
    id: 'orders',
    label: 'Заказы',
    icon: ClipboardDocumentListIcon,
    route: 'orders',
    roles: [UserRole.ADMIN, UserRole.BARISTA]
  },
  {
    id: 'analytics',
    label: 'Аналитика',
    icon: ChartBarIcon,
    route: 'analytics',
    roles: [UserRole.ADMIN]
  },
  {
    id: 'menu',
    label: 'Меню',
    icon: CogIcon,
    route: 'menu',
    roles: [UserRole.ADMIN]
  },
  {
    id: 'bonuses',
    label: 'Бонусы',
    icon: GiftIcon,
    route: 'bonuses',
    roles: [UserRole.ADMIN]
  },
  {
    id: 'achievements',
    label: 'Достижения',
    icon: TrophyIcon,
    route: 'achievements',
    roles: [UserRole.ADMIN]
  },
  {
    id: 'promotions',
    label: 'Акции',
    icon: MegaphoneIcon,
    route: 'promotions',
    roles: [UserRole.ADMIN]
  },
  {
    id: 'stories',
    label: 'Истории',
    icon: PhotoIcon,
    route: 'stories',
    roles: [UserRole.ADMIN]
  },
  {
    id: 'users',
    label: 'Пользователи',
    icon: UserGroupIcon,
    route: 'users',
    roles: [UserRole.ADMIN]
  }
];

/**
 * Мобильная навигация для админ-панели
 */
export const MobileAdminNavigation: React.FC<MobileAdminNavigationProps> = ({
  currentRoute,
  onRouteChange
}) => {
  const currentUserId = getCurrentUserId();
  const userRole = getUserRole(currentUserId);

  // Фильтруем пункты навигации по роли пользователя
  const availableItems = NAVIGATION_ITEMS.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {availableItems.map((item) => {
          const isActive = currentRoute === item.route;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              onClick={() => onRouteChange(item.route)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl flex-1 max-w-[80px] ${
                isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                {item.label}
              </span>
              
              {isActive && (
                <motion.div
                  className="absolute bottom-0 left-1/2 w-1 h-1 bg-blue-600 rounded-full"
                  layoutId="activeIndicator"
                  style={{ x: '-50%' }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

/**
 * Хук для управления мобильной навигацией
 */
export const useMobileAdminNavigation = (initialRoute: string = 'dashboard') => {
  const [currentRoute, setCurrentRoute] = React.useState(initialRoute);

  const handleRouteChange = React.useCallback((route: string) => {
    setCurrentRoute(route);
  }, []);

  return {
    currentRoute,
    setCurrentRoute: handleRouteChange
  };
};
