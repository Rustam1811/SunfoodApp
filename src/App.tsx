import React from "react";
import {
  IonApp,
  IonContent,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Switch, Route, Redirect, Link } from "react-router-dom";
import {
  homeOutline,
  bagOutline,
  calendarOutline,
  trophyOutline,
  menuOutline,
  personCircleOutline,
} from "ionicons/icons";
import LanguageSwitcher from "./Languagebutton";
import Home from "./pages/Home";
import Order from "./pages/Order";
import Booking from "./pages/Booking";
import Bonus from "./pages/Bonus";
import Menu from "./pages/menu/Menu";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Admin from "../admin/App";
import { CartProvider } from "./contexts/CartContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import "@ionic/react/css/core.css";
import "./index.css";
import EnvCheck from './pages/EnvCheck';

const AppHeader: React.FC = () => (
  <div className="bg-[#182447] rounded-b-3xl pb-2 pt-7 px-6 shadow-md">
    <div className="flex items-center justify-between">
        <span className=" flex items-center font-bold text-white">Coffee Addict</span>
      </div>
      <LanguageSwitcher />
    </div>
);

const CleanBottomNav: React.FC = () => (
  <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
    <div className="bg-[#182447] rounded-2xl shadow-xl mx-4 mb-4 px-2 py-2 flex justify-around w-full max-w-md">
      <CleanNavItem to="/home" icon={homeOutline} label="Home" />
      <CleanNavItem to="/order" icon={bagOutline} label="Order" />
      <CleanNavItem to="/booking" icon={calendarOutline} label="Booking" />
      <CleanNavItem to="/bonus" icon={trophyOutline} label="Rewards" />
      <CleanNavItem to="/menu" icon={menuOutline} label="Menu" />
      <CleanNavItem to="/profile" icon={personCircleOutline} label="Profile" />
    </div>
  </div>
);

const CleanNavItem: React.FC<{ to: string; icon: string; label: string }> = ({
  to,
  icon,
  label
}) => (
  <Link
    to={to}
    className="flex flex-col items-center justify-center py-1 px-2 rounded-xl hover:bg-[#2c2119] transition-all duration-200 min-w-0 flex-1 group"
  >
    <span
      className="iconify w-6 h-6 text-[#ffe9b2] group-hover:text-[#fbbf24] transition-colors duration-200 mb-1"
      data-icon={icon}
    />
    <span className="text-xs text-[#ffe9b2] group-hover:text-[#fbbf24] font-medium transition-colors duration-200">
      {label}
    </span>
  </Link>
);

const App: React.FC = () => (

  <CartProvider>
    <LanguageProvider>
      <IonApp>
        <IonReactRouter>
          <AppHeader />
          <IonContent>
            <Switch>
              <Route exact path="/home" component={Home} />
              <Route exact path="/order" component={Order} />
              <Route exact path="/booking" component={Booking} />
              <Route exact path="/bonus" component={Bonus} />
              <Route exact path="/menu" component={Menu} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/register" component={Register} />
              <Route exact path="/profile" component={Profile} />
              <Route exact path="/admin" component={Admin} />
              <Route exact path="/env-check" component={EnvCheck} />
              <Route exact path="/">
                <Redirect to="/home" />
              </Route>
            </Switch>
          </IonContent>
          <CleanBottomNav />
        </IonReactRouter>
      </IonApp>
    </LanguageProvider>
  </CartProvider>

);

export default App;
