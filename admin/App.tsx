import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Redirect, Switch } from "react-router-dom";
import { UserContext } from "./contexts/UserContext";
import AdminRoutes from "./routes/AdminRoutes";

const App: React.FC = () => {
  const { user, loading } = useContext(UserContext);

  if (loading) return <div className="h-screen flex items-center justify-center">Загрузка...</div>;

  return (
    <Router basename="/admin">
      <Switch>
        <Route path="/login" component={AdminRoutes} />
        <Route
          path="/"
          render={() =>
            user && (user.role === "owner" || user.role === "admin") ? (
              <AdminRoutes />
            ) : (
              <Redirect to="/login" />
            )
          }
        />
      </Switch>
    </Router>
  );
};

export default App;
