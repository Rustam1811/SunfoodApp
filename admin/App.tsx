import React, { useContext } from "react";
import { Route, Redirect, Switch } from "react-router-dom";
import { UserProvider, UserContext } from "./contexts/UserContext";
import AdminRoutes from "./routes/AdminRoutes";

const AdminApp: React.FC = () => {
  const { user, loading } = useContext(UserContext);

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Загрузка...</div>;

  return (
    <Switch>
      <Route path="/admin/login" component={AdminRoutes} />
      <Route
        path="/admin"
        render={() =>
          user && (user.role === "owner" || user.role === "admin") ? (
            <AdminRoutes />
          ) : (
            <Redirect to="/admin/login" />
          )
        }
      />
    </Switch>
  );
};

export default () => (
  <UserProvider>
    <AdminApp />
  </UserProvider>
);
