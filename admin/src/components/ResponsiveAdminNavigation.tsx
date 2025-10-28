import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  ChartBarIcon, 
  CogIcon, 
  ClipboardDocumentListIcon,
  UserGroupIcon,
  GiftIcon,
  TrophyIcon,
  MegaphoneIcon,
  PhotoIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  // COMMENTED OUT - Delivery/Courier icons
  // TruckIcon,
  // MapPinIcon,
  // DocumentTextIcon
} from '@heroicons/react/24/outline';
import { UserContext, type Role } from '@/contexts/UserContext';


interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  roles: Role[];
}

interface ResponsiveAdminNavigationProps {
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
    roles: ['admin', 'barista']
  },
  /* COMMENTED OUT - Courier features
  {
    id: 'courier-dashboard',
    label: 'Мои доставки',
    icon: TruckIcon,
    route: 'courier-dashboard',
    roles: ['courier']
  },
  {
    id: 'courier-documents',
    label: 'Мои документы',
    icon: DocumentTextIcon,
    route: 'courier-documents',
    roles: ['courier']
  },
  */
  {
    id: 'orders',
    label: 'Заказы',
    icon: ClipboardDocumentListIcon,
    route: 'orders',
    roles: ['admin', 'barista']
  },
  {
    id: 'pos',
    label: 'POS',
    icon: ClipboardDocumentListIcon,
    route: 'pos',
    roles: ['admin', 'barista']
  },
  {
    id: 'menu',
    label: 'Меню',
    icon: CogIcon,
    route: 'menu',
    roles: ['admin', 'barista']
  },
  {
    id: 'analytics',
    label: 'Аналитика',
    icon: ChartBarIcon,
    route: 'analytics',
    roles: ['admin']
  },
  {
    id: 'bonuses',
    label: 'Бонусы',
    icon: GiftIcon,
    route: 'bonuses',
    roles: ['admin']
  },
  {
    id: 'achievements',
    label: 'Достижения',
    icon: TrophyIcon,
    route: 'achievements',
    roles: ['admin']
  },
  {
    id: 'promotions',
    label: 'Акции',
    icon: MegaphoneIcon,
    route: 'promotions',
    roles: ['admin']
  },
  {
    id: 'stories',
    label: 'Истории',
    icon: PhotoIcon,
    route: 'stories',
    roles: ['admin']
  },
  {
    id: 'users',
    label: 'Пользователи',
    icon: UserGroupIcon,
    route: 'users',
    roles: ['admin']
  },
  /* COMMENTED OUT - Delivery/Courier management
  {
    id: 'delivery',
    label: 'Доставка',
    icon: TruckIcon,
    route: 'delivery',
    roles: ['admin']
  },
  {
    id: 'couriers',
    label: 'Курьеры',
    icon: MapPinIcon,
    route: 'couriers',
    roles: ['admin']
  }
  */
];

/**
 * Респонсивная навигация для админ-панели
 * - Сайдбар на десктопе
 * - Скрыта на мобильных, открывается по клику на иконку
 */
export const ResponsiveAdminNavigation: React.FC<ResponsiveAdminNavigationProps> = ({
  currentRoute
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const { user } = useContext(UserContext);
  const userRole: Role = user?.role || 'user';

  // Проверяем размер экрана
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Фильтруем пункты навигации по роли пользователя
  const availableItems = NAVIGATION_ITEMS.filter(item => 
    item.roles.includes(userRole)
  );

  // Кнопка гамбургер для мобильных
  const HamburgerButton = () => (
    <motion.button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="md:hidden fixed top-4 left-4 z-50 bg-white p-3 rounded-lg shadow-lg border border-slate-200"
      whileTap={{ scale: 0.95 }}
    >
      {isMobileMenuOpen ? (
        <XMarkIcon className="w-6 h-6 text-slate-900" />
      ) : (
        <Bars3Icon className="w-6 h-6 text-slate-900" />
      )}
    </motion.button>
  );

  // Элемент навигации
  const NavigationItem = ({ item }: { item: NavigationItem }) => {
    const isActive = currentRoute === item.route;
    const Icon = item.icon;

    return (
      <NavLink
        to={`/admin/${item.route}`}
        className={`group flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${
          isActive 
            ? 'bg-slate-900 text-white shadow-md' 
            : 'text-slate-700 hover:bg-slate-100'
        }`}
        onClick={() => {
          if (isMobile) {
            setIsMobileMenuOpen(false);
          }
        }}
      >
        <Icon className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${
          isActive ? 'text-white' : 'text-slate-500'
        }`} />
        <span className={`font-medium ${isActive ? 'text-white' : 'text-slate-700'}`}>
          {item.label}
        </span>
        
        {isActive && (
          <div className="ml-auto w-2 h-2 bg-white rounded-full" />
        )}
      </NavLink>
    );
  };

  // Содержимое сайдбара
  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-white">
      {/* Шапка сайдбара */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Админ-панель</h2>
            <p className="text-xs text-slate-500">Sunfood Coffee</p>
          </div>
        </div>
        
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
          userRole === 'admin' 
            ? 'bg-slate-100 text-slate-900 border border-slate-200' 
            : 'bg-slate-100 text-slate-700 border border-slate-200'
        }`}>
          <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
          {userRole === 'admin' ? '👑 Администратор' : userRole === 'courier' ? '🚚 Курьер' : '☕ Бариста'}
        </div>
      </div>

      {/* Навигационные элементы */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {availableItems.map((item) => (
          <NavigationItem key={item.id} item={item} />
        ))}
      </nav>

      {/* Футер сайдбара */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="text-base">☕</span>
            Sunfood Coffee
          </span>
          <span className="text-slate-400">v2.0</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Кнопка гамбургер */}
      <HamburgerButton />

      {/* Десктопный сайдбар */}
      <div className="hidden md:flex h-screen w-64 bg-white fixed left-0 top-0 z-40 border-r border-slate-200 shadow-sm">
        <SidebarContent />
      </div>

      {/* Мобильный сайдбар */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <>
            {/* Оверлей */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
            />
            
            {/* Мобильный сайдбар */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white z-50 shadow-xl md:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer для десктопного контента */}
      <div className="hidden md:block w-64" />
    </>
  );
};

export default ResponsiveAdminNavigation;
