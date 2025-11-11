import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import MenuPage from "../pages/MenuPage";
import LoginPage from "../pages/LoginPage";
import Dashboard from "../pages/Dashboard";
import Promo from "../pages/Promo";
import Sales from "../pages/Sales";
import AdminLayout from "../components/AdminLayout";

const AdminRoutes: React.FC = () => (
  <Switch>
    <Route exact path="/login" component={LoginPage} />
    <Route path="/">
      <AdminLayout>
        <Switch>
          <Route exact path="/dashboard" component={Dashboard} />
          <Route exact path="/menu" component={MenuPage} />
          <Route exact path="/promo" component={Promo} />
          <Route exact path="/sales" component={Sales} />
          <Route exact path="/" render={() => <Redirect to="/dashboard" />} />
          <Redirect to="/dashboard" />
        </Switch>
      </AdminLayout>
    </Route>
  </Switch>
);

export default AdminRoutes;
