import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Redirect, Switch } from "react-router-dom";
import { UserProvider, UserContext } from "./contexts/UserContext";
import AdminRoutes from "./routes/AdminRoutes";
const App = () => {
    const { user, loading } = useContext(UserContext);
    if (loading)
        return <div className="h-screen flex items-center justify-center">Загрузка...</div>;
    return (<Router>
      <Switch>
        <Route path="/admin/login" component={AdminRoutes}/>
        <Route path="/admin" render={() => user && (user.role === "owner" || user.role === "admin") ? (<AdminRoutes />) : (<Redirect to="/admin/login"/>)}/>
      </Switch>
    </Router>);
};
export default () => (<UserProvider>
    <App />
  </UserProvider>);
