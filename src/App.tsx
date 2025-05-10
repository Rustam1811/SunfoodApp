import React from "react";
import {
  IonApp,
  IonRouterOutlet,
  IonTabs,
  IonIcon
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Switch, Route, Redirect } from "react-router-dom";
import {
  homeOutline,
  bagOutline,
  calendarOutline,
  trophyOutline,
  menuOutline,
  personCircleOutline,
} from "ionicons/icons";
import { Link } from "react-router-dom";

import Home from "./pages/Home";
import Order from "./pages/Order";
import Booking from "./pages/Booking";
import Bonus from "./pages/Bonus";
import Menu from "./pages/menu/Menu";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Admin from "../admin/App";
import { CartProvider } from "./pages/CartContext";
import { LanguageProvider } from "./contexts/LanguageContext";

import "@ionic/react/css/core.css";
import "./index.css";
import EnvCheck from './pages/EnvCheck';

const App: React.FC = () => (
  <IonApp className="bg-white">
    <LanguageProvider>
    <CartProvider>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Switch>
              <Route path="/admin" component={Admin} />
              <Route path="/home" component={Home} exact />
              <Route path="/order" component={Order} exact />
              <Route path="/booking" component={Booking} exact />
              <Route path="/bonus" component={Bonus} exact />
              <Route path="/menu" component={Menu} exact />
              <Route path="/login" component={Login} exact />
              <Route path="/register" component={Register} exact />
              <Route path="/profile" component={Profile} exact />
              <Route path="/env" component={EnvCheck} exact />
              <Redirect to="/login" />
            </Switch>
          </IonRouterOutlet>
        </IonTabs>

        {/* Фиксированная нижняя навигация */}
        <BottomNav />
      </IonReactRouter>
    </CartProvider>
    </LanguageProvider>
  </IonApp>
);

const BottomNav: React.FC = () => (
  <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-md py-2 px-2 flex justify-around items-center z-[1000]">
    <NavItem to="/home" icon={homeOutline} label="Главная" color="#000" />
    <NavItem to="/order" icon={bagOutline} label="Заказ" color="#000" />
    <NavItem to="/booking" icon={calendarOutline} label="Бронь" color="#000" />
    <NavItem to="/bonus" icon={trophyOutline} label="Бонусы" color="#000" />
    <NavItem to="/menu" icon={menuOutline} label="Меню" color="#000" />
    <NavItem to="/profile" icon={personCircleOutline} label="Аккаунт" color="#000" />
  </div>
);

const NavItem: React.FC<{ to: string; icon: string; label: string; color: string }> = ({ to, icon, label, color }) => (
  <Link
    to={to}
    className="no-underline flex flex-col items-center flex-1 text-center transition transform hover:scale-105 active:scale-95"
  >
    <IonIcon icon={icon} style={{ color }} className="text-2xl" />
    <span className="mt-1 text-xs font-semibold text-black">{label}</span>
  </Link>
);
console.log("🧪 BACKEND_URL:", import.meta.env.VITE_BACKEND_URL);

export default App;
