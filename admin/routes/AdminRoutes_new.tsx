import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import MenuPageNew from "../pages/MenuPageNew";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import Dashboard from "../pages/Dashboard";
import Analytics from "../pages/Analytics";
import OrderManagement from "../pages/OrderManagement";

const AdminRoutes: React.FC = () => (
  <Switch>
    <Route exact path="/admin/login" component={LoginPage} />
    <Route exact path="/admin/dashboard" component={Dashboard} />
    <Route exact path="/admin/home" component={HomePage} />
    <Route exact path="/admin/menu" component={MenuPageNew} />
    <Route exact path="/admin/menupage" component={MenuPageNew} />
    <Route exact path="/admin/analytics" component={Analytics} />
    <Route exact path="/admin/orders" component={OrderManagement} />
    <Redirect from="/admin" to="/admin/dashboard" />
  </Switch>
);

export default AdminRoutes;
