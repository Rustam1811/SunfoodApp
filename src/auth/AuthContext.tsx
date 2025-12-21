/**
 * AuthContext - Simple Phone + Password Authentication
 * 
 * Users login with phone number and password.
 * New users are automatically registered.
 * Admin has fixed credentials.
 * 
 * @module auth/AuthContext
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  loginOrRegister,
  getUserById,
  updateUserProfile,
  updateUserStats,
  saveSession,
  getSession,
  clearSession,
  type User,
} from '../services/authService';

// ============================================================================
// Types
// ============================================================================

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isNewUser: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<Pick<User, 
    'name' | 'avatar' | 'phone' | 'height' | 'weight' | 'targetWeight' | 'goal' | 'level' | 'weeklyGoal'
  >>) => Promise<void>;
  updateStats: (stats: { rank?: number; totalWorkouts?: number; points?: number; streak?: number }) => Promise<void>;
  refreshUser: () => Promise<void>;
};

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ============================================================================
// Provider
// ============================================================================

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const userId = getSession();
        if (userId) {
          const userData = await getUserById(userId);
          if (userData && userData.isActive) {
            setUser(userData);
          } else {
            clearSession();
          }
        }
      } catch (error) {
        console.error('Session restore error:', error);
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Login function
  const login = useCallback(async (phone: string, password: string) => {
    setLoading(true);
    try {
      const result = await loginOrRegister(phone, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        setIsNewUser(result.isNewUser || false);
        saveSession(result.user.id);
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Произошла ошибка. Попробуйте снова.' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    setUser(null);
    setIsNewUser(false);
    clearSession();
  }, []);

  // Update profile
  const updateProfileFn = useCallback(async (data: Partial<Pick<User, 
    'name' | 'avatar' | 'phone' | 'height' | 'weight' | 'targetWeight' | 'goal' | 'level' | 'weeklyGoal'
  >>) => {
    if (!user) return;
    
    await updateUserProfile(user.id, data);
    setUser((prev) => prev ? { ...prev, ...data } : null);
  }, [user]);

  // Update stats
  const updateStats = useCallback(async (stats: { rank?: number; totalWorkouts?: number; points?: number; streak?: number }) => {
    if (!user) return;
    
    await updateUserStats(user.id, stats);
    setUser((prev) => prev ? { ...prev, ...stats } : null);
  }, [user]);

  // Refresh user data from Firestore
  const refreshUser = useCallback(async () => {
    if (!user) return;
    
    const freshUser = await getUserById(user.id);
    if (freshUser) {
      setUser(freshUser);
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    loading,
    isNewUser,
    login,
    logout,
    updateProfile: updateProfileFn,
    updateStats,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
