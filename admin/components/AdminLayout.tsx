import React, { useContext } from "react";
import { NavLink, useHistory } from "react-router-dom";
import { 
  HomeIcon, 
  Squares2X2Icon, 
  TagIcon, 
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';
import { UserContext } from "../contexts/UserContext";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useContext(UserContext);
  const history = useHistory();

  const handleLogout = () => {
    logout();
    history.push('/login');
  };

  const navItems = [
    { to: "/dashboard", icon: HomeIcon, label: "Главная" },
    { to: "/menu", icon: Squares2X2Icon, label: "Меню" },
    { to: "/promo", icon: TagIcon, label: "Акции" },
    { to: "/sales", icon: ChartBarIcon, label: "Продажи" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Верхняя панель */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SparklesIcon className="w-8 h-8 text-yellow-500" />
            <div>
              <h1 className="text-2xl font-bold">SunfoodApp Admin</h1>
              <p className="text-sm text-gray-300">Панель управления</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold">{user?.email || 'Админ'}</p>
              <p className="text-xs text-gray-300">{user?.role || 'owner'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
              title="Выйти"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Навигация */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex items-center gap-2 px-6 py-4 font-medium transition-colors text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                activeClassName="text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Контент */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
