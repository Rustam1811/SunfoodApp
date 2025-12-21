import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { auth } from '../firebase';

type AdminAuthContextValue = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  accessPending: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export const useAdminAuth = (): AdminAuthContextValue => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

async function verifyAdmin(user: User): Promise<boolean> {
  const token = await user.getIdTokenResult(true);
  const role = token.claims.role;
  return token.claims.admin === true || role === 'admin' || role === 'owner';
}

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessPending, setAccessPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (!isMounted) return;
      setLoading(true);
      setError(null);

      if (!nextUser) {
        setUser(null);
        setIsAdmin(false);
        setAccessPending(false);
        setLoading(false);
        return;
      }

      try {
        const admin = await verifyAdmin(nextUser);
        setUser(nextUser);
        setIsAdmin(admin);
        setAccessPending(!admin);
      } catch (err) {
        console.error('[AdminAuth] Failed to verify claims:', err);
        setError('Failed to verify admin access.');
        setUser(nextUser);
        setIsAdmin(false);
        setAccessPending(true);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await credential.user.getIdToken(true);
    } catch (err) {
      console.error('[AdminAuth] Login error:', err);
      setError('Invalid credentials.');
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    await signOut(auth);
    setLoading(false);
  };

  const value = useMemo(
    () => ({ user, loading, isAdmin, accessPending, error, login, logout }),
    [user, loading, isAdmin, accessPending, error]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};
