import React from 'react';
import { BrowserRouter, Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './auth/AdminAuthContext';
import { AdminLayout } from './components/AdminLayout';
import { AccessPending } from './pages/AccessPending';
import { Dashboard } from './pages/Dashboard';
import { Entities } from './pages/Entities';
import { Flows } from './pages/Flows';
import { Login } from './pages/Login';

const AdminGate: React.FC = () => {
  const { user, loading, isAdmin } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--admin-bg)] p-8 text-sm text-[color:var(--admin-muted)]">
        Loading admin console...
      </div>
    );
  }

  if (!user) {
    return <Redirect to={{ pathname: '/login', state: { from: location.pathname } }} />;
  }

  if (!isAdmin) {
    return (
      <AdminLayout>
        <AccessPending />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Switch>
        <Route exact path="/dashboard" component={Dashboard} />
        <Route exact path="/entities" component={Entities} />
        <Route exact path="/flows" component={Flows} />
        <Redirect to="/dashboard" />
      </Switch>
    </AdminLayout>
  );
};

export const App: React.FC = () => (
  <BrowserRouter basename="/admin">
    <AdminAuthProvider>
      <Switch>
        <Route exact path="/login" component={Login} />
        <Route path="/" component={AdminGate} />
      </Switch>
    </AdminAuthProvider>
  </BrowserRouter>
);
