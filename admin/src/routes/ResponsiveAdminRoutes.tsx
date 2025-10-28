import React, { useContext } from 'react';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';
import { UserContext, type Role } from '@/contexts/UserContext';


// Импорт компонентов страниц
import Dashboard from '@/pages/Dashboard';
import OrderManagement from '@/pages/OrderManagement';
import Analytics from '@/pages/Analytics';
import PosMenuPage from '@/pages/PosMenuPage';
import BonusManagement from '@/pages/BonusManagement';
import AchievementManagement from '@/pages/AchievementManagement';
import PromotionManagement from '@/pages/PromotionManagement';
import InstagramStoriesAdminPageNew from '@/pages/InstagramStoriesAdminPageNew';
import PosPage from '@/pages/PosPage';
import UsersPage from '@/pages/UsersPage';
// COMMENTED OUT - Delivery/Courier features
// import DeliveryManagement from '@/pages/DeliveryManagement';
// import CourierManagement from '@/pages/CourierManagement';
// import CourierDashboard from '@/pages/CourierDashboard';
// import CourierDocumentsPage from '@/pages/CourierDocumentsPage';

// Новая респонсивная навигация
import ResponsiveAdminNavigation from '@/components/ResponsiveAdminNavigation';

/**
 * Основной компонент админ-панели с респонсивной навигацией
 */
const ResponsiveAdminRoutes: React.FC = () => {
  console.log('🔀 ResponsiveAdminRoutes rendering...');
  const location = useLocation();
  console.log('🔀 Current location:', location.pathname);
  const { user } = useContext(UserContext);
  console.log('🔀 User in routes:', user);
  const userRole: Role = user?.role || 'user';

  // Helper functions
  const getRoleLabel = (role: Role): string => {
    switch(role) {
      case 'admin': return 'Администратор';
      case 'barista': return 'Бариста';
      case 'courier': return 'Курьер';
      case 'owner': return 'Владелец';
      default: return 'Пользователь';
    }
  };

  const getRoleBadgeClass = (role: Role): string => {
    switch(role) {
      case 'admin': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'barista': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'courier': return 'bg-green-100 text-green-700 border border-green-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  // Определяем текущий маршрут из URL (учитываем base: '/admin/')
  const getCurrentRoute = () => {
    const path = location.pathname.replace(/^\/admin\//, '').replace(/^\//, '');
    return path || 'dashboard';
  };

  const currentRoute = getCurrentRoute();

  const handleRouteChange = () => {
    // Программная навигация будет осуществляться через history.push в навигационном компоненте
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Респонсивная навигация */}
      <ResponsiveAdminNavigation 
        currentRoute={currentRoute}
        onRouteChange={handleRouteChange}
      />

      {/* Основной контент */}
      <div className="flex-1 flex flex-col">
        {/* Шапка (только на мобильных, на десктопе информация в сайдбаре) */}
        <header className="md:hidden bg-white shadow-md border-b border-slate-200 sticky top-0 z-30 ml-0">
          <div className="px-4 py-3 pl-16"> {/* pl-16 для места под кнопку гамбургер */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900">☕ Админ-панель</h1>
                <p className="text-sm text-slate-600">
                  {getRoleLabel(userRole)} • {user?.email || 'Неизвестно'}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(userRole)}`}>
                {getRoleLabel(userRole)}
              </div>
            </div>
          </div>
        </header>

        {/* Контентная область */}
        <main className="flex-1 bg-slate-100 p-6 overflow-auto">
          <div className="w-full max-w-7xl mx-auto">
            <Switch>
              <Route exact path="/admin/dashboard">
                <div className="bg-white rounded-lg shadow p-6">
                  <Dashboard />
                </div>
              </Route>
              {/* COMMENTED OUT - Courier routes
              <Route exact path="/admin/courier-dashboard">
                <div className="bg-white rounded-lg shadow p-6">
                  {userRole === 'courier' ? <CourierDashboard /> : <div className="p-6 text-center text-gray-500">Нет доступа</div>}
                </div>
              </Route>
              <Route exact path="/admin/courier-documents">
                <div className="bg-white rounded-lg shadow p-6">
                  {userRole === 'courier' ? <CourierDocumentsPage /> : <div className="p-6 text-center text-gray-500">Нет доступа</div>}
                </div>
              </Route>
              */}
              <Route exact path="/admin/orders">
                <div className="bg-white rounded-lg shadow p-6">
                  <OrderManagement />
                </div>
              </Route>
              <Route exact path="/admin/analytics">
                <div className="bg-white rounded-lg shadow p-6">
                  {userRole === 'admin' ? <Analytics /> : <div className="p-6 text-center text-gray-500">Нет доступа</div>}
                </div>
              </Route>
              <Route exact path="/admin/menu">
                {/* POS-меню для быстрого добавления в корзину */}
                <PosMenuPage />
              </Route>
              <Route exact path="/admin/bonuses">
                <div className="bg-white rounded-lg shadow p-6">
                  {userRole === 'admin' ? <BonusManagement /> : <div className="p-6 text-center text-gray-500">Нет доступа</div>}
                </div>
              </Route>
              <Route exact path="/admin/achievements">
                <div className="bg-white rounded-lg shadow p-6">
                  {userRole === 'admin' ? <AchievementManagement /> : <div className="p-6 text-center text-gray-500">Нет доступа</div>}
                </div>
              </Route>
              <Route exact path="/admin/promotions">
                <div className="bg-white rounded-lg shadow p-6">
                  {userRole === 'admin' ? <PromotionManagement /> : <div className="p-6 text-center text-gray-500">Нет доступа</div>}
                </div>
              </Route>
              <Route exact path="/admin/stories">
                <div className="bg-white rounded-lg shadow p-6">
                  {userRole === 'admin' ? <InstagramStoriesAdminPageNew /> : <div className="p-6 text-center text-gray-500">Нет доступа</div>}
                </div>
              </Route>
              <Route exact path="/admin/pos">
                <div className="bg-white rounded-lg shadow p-6">
                  <PosPage />
                </div>
              </Route>
              <Route exact path="/admin/users">
                <div className="bg-white rounded-lg shadow p-6">
                  {userRole === 'admin' ? <UsersPage /> : <div className="p-6 text-center text-gray-500">Нет доступа</div>}
                </div>
              </Route>
              {/* COMMENTED OUT - Delivery/Courier management
              <Route exact path="/admin/delivery">
                <div className="bg-white rounded-lg shadow p-6">
                  {userRole === 'admin' ? <DeliveryManagement /> : <div className="p-6 text-center text-gray-500">Нет доступа</div>}
                </div>
              </Route>
              <Route exact path="/admin/couriers">
                <div className="bg-white rounded-lg shadow p-6">
                  {userRole === 'admin' ? <CourierManagement /> : <div className="p-6 text-center text-gray-500">Нет доступа</div>}
                </div>
              </Route>
              */}
              <Redirect from="/admin" exact to="/admin/dashboard" />
              <Redirect from="/" exact to="/admin/dashboard" />
            </Switch>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResponsiveAdminRoutes;
