import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import MenuPage from "../pages/MenuPage";
import LoginPage from "../pages/LoginPage";

const AdminRoutes: React.FC = () => (
  <Switch>
    <Route exact path="/admin/login" component={LoginPage} />
    <Route exact path="/admin/menupage" component={MenuPage} />
    <Redirect to="/admin/menupage" />
  </Switch>
);

export default AdminRoutes;
