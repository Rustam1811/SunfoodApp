// src/App.tsx

import React from 'react';
import { BrowserRouter, Switch, Route, Redirect, NavLink, useRouteMatch } from "react-router-dom";
import { motion } from 'framer-motion';
import { HomeIcon, Squares2X2Icon, ShoppingBagIcon, CalendarDaysIcon, UserCircleIcon } from '@heroicons/react/24/solid';

// Импорты страниц с правильными именами
import Home from './pages/Home';
import Profile from './pages/Profile';
import Menu from './pages/menu/Drinks';
import Order from './pages/Order';
import Booking from './pages/Booking';

// Контексты
import { CartProvider } from './contexts/CartContext';
import { LanguageProvider } from './contexts/LanguageContext';

import "./index.css";

// ===================================================================
//  КОМПОНЕНТЫ НАВИГАЦИИ
// ===================================================================
const navItems = [
    { to: "/home", icon: HomeIcon, label: "Главная" },
    { to: "/menu", icon: Squares2X2Icon, label: "Меню" },
    { to: "/order", icon: ShoppingBagIcon, label: "Заказ" },
    { to: "/booking", icon: CalendarDaysIcon, label: "Бронь" },
    { to: "/profile", icon: UserCircleIcon, label: "Профиль" },
];

const NavItem = ({ to, icon: Icon, label }: { to: string, icon: React.ElementType, label: string }) => {
    const match = useRouteMatch({ path: to, exact: true });
    const isActive = !!match;

    return (
        <NavLink to={to} className="relative flex flex-col items-center justify-center py-2 px-1 rounded-xl text-zinc-500 hover:text-amber-500 transition-colors duration-200 min-w-0 flex-1 group">
            <>
                <Icon className={`w-6 h-6 transition-colors ${isActive ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                <span className={`text-xs mt-1 transition-colors ${isActive ? 'font-bold text-white' : 'font-medium text-zinc-400 group-hover:text-zinc-200'}`}>
                    {label}
                </span>
                {isActive && (
                    <motion.div
                        layoutId="active-nav-indicator"
                        className="absolute bottom-[-8px] h-1 w-6 bg-amber-400 rounded-full"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                )}
            </>
        </NavLink>
    );
};

const BottomNavBar = () => (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3">
        <div className="bg-zinc-800/70 backdrop-blur-lg rounded-2xl shadow-xl mx-auto px-2 py-1 flex justify-around w-full max-w-md border border-zinc-700/80">
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
                <>
                    <main>
                        <Switch>
                            <Route exact path="/home" component={Home} />
                            <Route exact path="/menu" component={Menu} />
                            <Route exact path="/profile" component={Profile} />
                            <Route exact path="/booking" component={Booking} />
                            <Route exact path="/order" component={Order} />
                            <Route exact path="/"><Redirect to="/home" /></Route>
                        </Switch>
                    </main>
                    <BottomNavBar />
                </>
            </BrowserRouter>
        </LanguageProvider>
    </CartProvider>
);

export default App;