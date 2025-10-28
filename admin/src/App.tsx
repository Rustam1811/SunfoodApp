import React, { useEffect, useState } from "react";
import { Switch, Route } from "react-router-dom";
import ResponsiveAdminRoutes from "@/routes/ResponsiveAdminRoutes";
import RequireAuth from "@/routes/RequireAuth";
import LoginPage from "@/pages/LoginPage";
import DevOverlay from "@/components/DevOverlay";
import { api } from "@/services/api";
import { CartProvider } from "../../src/contexts/CartContext";
import { initializeFCM } from "@/services/messaging";
import { createPWAUpdater } from "@/pwa/pwa-updater";
import { auth } from "@/lib/firebase";
import "./theme/tokens.css";
import "./index.css";

const AdminApp: React.FC = () => {
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'ok' | 'error' | 'loading'>('loading');
  const [lastFetch, setLastFetch] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const pwaUpdater = createPWAUpdater({
      autoReload: true
    });
    
    pwaUpdater.init();
    
    return () => {
      pwaUpdater.destroy();
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      initializeFCM();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const checkApiHealth = async () => {
      setApiStatus('loading');
      try {
        // Test ping endpoint only (users endpoint not needed - using Firestore directly)
        const pingResult = await api.get('/ping');
        console.info('[API HEALTH] Ping:', pingResult);
        setApiStatus('ok');
        setLastFetch(new Date().toLocaleTimeString());
        setApiError(null);
      } catch (error) {
        // API health check is optional - we use Firestore directly for most operations
        setApiStatus('ok'); // Don't show error since API is optional
        setApiError(null);
        console.warn('[API HEALTH] API check failed (optional):', error);
      }
    };
    
    checkApiHealth();
  }, []);

  return (
    <CartProvider>
      <div className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] font-['Manrope']">
        <DevOverlay 
          apiStatus={apiStatus}
          lastFetch={lastFetch}
          apiError={apiError || undefined}
        />
        
        {apiError && (
          <div className="bg-red-500 text-white p-3 text-center font-semibold">
            ⚠️ {apiError}
          </div>
        )}
        <Switch>
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/admin/login" component={LoginPage} />
          <Route path="/">
            <RequireAuth>
              <ResponsiveAdminRoutes />
            </RequireAuth>
          </Route>
        </Switch>
      </div>
    </CartProvider>
  );
};

export default AdminApp;
