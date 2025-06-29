import React from 'react';
// ✨ ИСПРАВЛЕНО: Используем стандартные импорты из react-router-dom v5
import { BrowserRouter, Switch, Route, Redirect, NavLink, useRouteMatch } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiCoffee, FiCalendar, FiGrid, FiUser } from 'react-icons/fi';

// ✨ ИСПРАВЛЕНО: Имена импортов приведены в соответствие с вашими файлами
import Home from './pages/Home';
import Profile from './pages/Profile';
import Menu from './pages/menu/Drinks'; // Предполагая, что из Drinks.tsx экспортируется Menu
import Order from './pages/Order';
import Booking from './pages/Booking';

// Контексты
import { CartProvider } from './contexts/CartContext';
import { LanguageProvider } from './contexts/LanguageContext';

// Глобальные стили
import "./index.css";

// ===================================================================
//  КОМПОНЕНТЫ НАВИГАЦИИ (без изменений)
// ===================================================================

const navItems = [
    { to: "/home", icon: FiHome, label: "Главная" },
    { to: "/menu", icon: FiGrid, label: "Меню" },
    { to: "/order", icon: FiCoffee, label: "Заказ" },
    { to: "/booking", icon: FiCalendar, label: "Бронь" },
    { to: "/profile", icon: FiUser, label: "Профиль" },
];

const NavItem = ({ to, icon: Icon, label }: { to: string, icon: React.ElementType, label: string }) => {
    const match = useRouteMatch({ path: to, exact: true });
    const isActive = !!match;

    return (
        <NavLink to={to} className="relative flex flex-col items-center justify-center py-2 px-1 rounded-xl text-slate-500 hover:text-orange-500 transition-colors duration-200 min-w-0 flex-1 group">
            <>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-orange-500' : ''} />
                <span className={`text-xs mt-1 transition-all ${isActive ? 'font-bold text-orange-500' : 'font-medium'}`}>
                    {label}
                </span>
                {isActive && (
                    <motion.div
                        layoutId="active-nav-indicator"
                        className="absolute bottom-[-8px] h-1 w-6 bg-orange-500 rounded-full"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                )}
            </>
        </NavLink>
    );
};

const BottomNavBar = () => (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3">
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl mx-auto px-2 py-1 flex justify-around w-full max-w-md border border-white/50">
            {navItems.map(item => <NavItem key={item.to} {...item} />)}
        </div>
    </div>
);

// ===================================================================
//  ГЛАВНЫЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ
// ===================================================================

const App: React.FC = () => (
    <CartProvider>
        <LanguageProvider>
            <BrowserRouter>
                <div className="font-sans">
                    <main>
                        <Switch>
                            {/* Убедитесь, что имена компонентов соответствуют тем, что экспортируются из файлов */}
                            <Route exact path="/home" component={Home} />
                            <Route exact path="/menu" component={Menu} />
                            <Route exact path="/profile" component={Profile} />
                            <Route exact path="/booking" component={Booking} />
                            
                            {/* ✨ ИСПРАВЛЕНО: Заглушка заменена на реальный компонент Order */}
                            <Route exact path="/order" component={Order} />

                            {/* Редирект с главной страницы */}
                            <Route exact path="/">
                                <Redirect to="/home" />
                            </Route>
                        </Switch>
                    </main>
                    <BottomNavBar />
                </div>
            </BrowserRouter>
        </LanguageProvider>
    </CartProvider>
);

export default App;