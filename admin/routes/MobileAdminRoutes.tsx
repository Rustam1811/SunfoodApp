import React from 'react';
import { MobileAdminNavigation, useMobileAdminNavigation } from '../components/MobileAdminNavigation';
import { UserRole, getUserRole, getCurrentUserId, getRoleDisplayName } from '../../src/utils/userRoles';
import { motion, AnimatePresence, anticipate } from 'framer-motion';

// Импорт страниц
import Dashboard from '../pages/Dashboard';
import OrderManagement from '../pages/OrderManagement';
import Analytics from '../pages/Analytics';
import MenuPageNew from '../pages/MenuPageNew';
import BonusManagement from '../pages/BonusManagement';
import AchievementManagement from '../pages/AchievementManagement';
import PromotionManagement from '../pages/PromotionManagement';
import StoryManagement from '../pages/StoryManagement';

/**
 * Главный роутер админ-панели с мобильной навигацией
 */
const MobileAdminRoutes: React.FC = () => {
  const { currentRoute, setCurrentRoute } = useMobileAdminNavigation('orders');
  const currentUserId = getCurrentUserId();
  const userRole = getUserRole(currentUserId);
  const roleDisplayName = getRoleDisplayName(userRole);

  /**
   * Рендер текущей страницы
   */
  const renderCurrentPage = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <Dashboard />;
      case 'orders':
        return <OrderManagement />;
      case 'analytics':
        return userRole === UserRole.ADMIN ? <Analytics /> : <div>Нет доступа</div>;
      case 'menu':
        return userRole === UserRole.ADMIN ? <MenuPageNew /> : <div>Нет доступа</div>;
      case 'bonuses':
        return userRole === UserRole.ADMIN ? <BonusManagement /> : <div>Нет доступа</div>;
      case 'achievements':
        return userRole === UserRole.ADMIN ? <AchievementManagement /> : <div>Нет доступа</div>;
      case 'promotions':
        return userRole === UserRole.ADMIN ? <PromotionManagement /> : <div>Нет доступа</div>;
      case 'stories':
        return userRole === UserRole.ADMIN ? <StoryManagement /> : <div>Нет доступа</div>;
      case 'users':
        return userRole === UserRole.ADMIN ? <div>Управление пользователями (в разработке)</div> : <div>Нет доступа</div>;
      default:
        return <OrderManagement />;
    }
  };

  /**
   * Анимации для переключения страниц
   */
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: 'tween' as const,
    ease: anticipate,
    duration: 0.3
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20"> {/* pb-20 для места под навигацию */}
      {/* Шапка с информацией о пользователе */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Админ-панель</h1>
              <p className="text-sm text-gray-500">{roleDisplayName} • ID: {currentUserId}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                userRole === UserRole.ADMIN 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {roleDisplayName}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRoute}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="h-full"
          >
            {renderCurrentPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Мобильная навигация */}
      <MobileAdminNavigation 
        currentRoute={currentRoute}
        onRouteChange={setCurrentRoute}
      />
    </div>
  );
};

export default MobileAdminRoutes;
