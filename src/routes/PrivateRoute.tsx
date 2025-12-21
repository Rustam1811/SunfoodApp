import React from 'react';
import { Route, Redirect, RouteProps, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContextV2';

interface PrivateRouteProps extends Omit<RouteProps, 'component' | 'render'> {
  component?: React.ComponentType<unknown>;
  children?: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, children, ...rest }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Загрузка…</div>
      </div>
    );
  }

  return (
    <Route {...rest}>
      {user ? (
        Component ? <Component /> : children
      ) : (
        <Redirect
          to={{
            pathname: '/login',
            state: { from: location.pathname }
          }}
        />
      )}
    </Route>
  );
};

export default PrivateRoute;
