import React from "react";
import {
  IonApp,
  IonRouterOutlet,
  IonTabs,
  IonIcon,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Switch, Route, Redirect } from "react-router-dom"; 
import {
  homeOutline,
  cartOutline,
  calendarOutline,
  starOutline,
  imagesOutline,
  logInOutline,
} from "ionicons/icons";
import { Link } from "react-router-dom";

import Home from "./pages/Home";
import Order from "./pages/Order";
import Booking from "./pages/Booking";
import Bonus from "./pages/Bonus";
import Menu from "./pages/menu/Menu";
import Login from "./components/Login";

import "@ionic/react/css/core.css";
import "./index.css";

const App: React.FC = () => (
  <IonApp className="bg-[#2C1B18]">
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Switch>
            <Route path="/home" component={Home} exact />
            <Route path="/order" component={Order} exact />
            <Route path="/booking" component={Booking} exact />
            <Route path="/bonus" component={Bonus} exact />
            <Route path="/menu" component={Menu} exact />
            <Route path="/login" component={Login} exact />
            <Redirect to="/login" />
          </Switch>
        </IonRouterOutlet>

        <div className="fixed bottom-0 left-0 w-full bg-[#3E2723] shadow-2xl flex justify-around py-2 z-[1000]">
          <NavItem to="/home" icon={homeOutline} label="Главная" />
          <NavItem to="/order" icon={cartOutline} label="Заказ" />
          <NavItem to="/booking" icon={calendarOutline} label="Бронь" />
          <NavItem to="/bonus" icon={starOutline} label="Бонусы" />
          <NavItem to="/menu" icon={imagesOutline} label="Меню" />
          <NavItem to="/login" icon={logInOutline} label="Аккаунт" />
        </div>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

const NavItem: React.FC<{ to: string; icon: string; label: string }> = ({ to, icon, label }) => (
  <Link to={to} className="flex flex-col items-center text-[#D7CCC8] no-underline">
    <IonIcon icon={icon} className="text-2xl" />
    <span className="text-xs font-semibold">{label}</span>
  </Link>
);

export default App;
