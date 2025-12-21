/**
 * Login Page V2 - Production-Ready Authentication
 * 
 * Features:
 * - Phone + password authentication
 * - Auto-registration for new users
 * - Role-based redirect after login
 * - Error handling with user-friendly messages
 * - Demo login support for testing
 * 
 * @module pages/LoginV2
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhoneIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/solid';
import { useAuth } from '../auth/AuthContextV2';

// ============================================================================
// Types
// ============================================================================

interface LocationState {
  redirect?: string;
  from?: { pathname: string };
}

// ============================================================================
// Constants
// ============================================================================

const DEMO_CREDENTIALS = {
  client: { phone: '+77770001111', password: 'demo123', label: 'Demo Client' },
  coach: { phone: '+77770002222', password: 'coach123', label: 'Demo Coach' },
  admin: { phone: '+77001234567', password: 'admin123', label: 'Admin' },
};

// ============================================================================
// Phone Input Formatter
// ============================================================================

function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters except +
  const cleaned = value.replace(/[^\d+]/g, '');
  
  // Ensure it starts with + or add it
  if (!cleaned.startsWith('+') && cleaned.length > 0) {
    return `+${cleaned}`;
  }
  
  return cleaned;
}

// ============================================================================
// Main Component
// ============================================================================

const LoginV2: React.FC = () => {
  const history = useHistory();
  const location = useLocation<LocationState>();
  const { login, isAuthenticated, loading: authLoading, getRedirectPath } = useAuth();
  
  // Form state
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Refs
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const destination = location.state?.redirect || getRedirectPath();
      history.replace(destination);
    }
  }, [isAuthenticated, authLoading, history, location.state, getRedirectPath]);

  // Focus phone input on mount
  useEffect(() => {
    phoneInputRef.current?.focus();
  }, []);

  // Handle phone input change
  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    setError('');
  }, []);

  // Handle password input change
  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError('');
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!phone || phone.length < 10) {
      setError('Введите корректный номер телефона');
      phoneInputRef.current?.focus();
      return;
    }
    
    if (!password || password.length < 4) {
      setError('Пароль должен быть минимум 4 символа');
      passwordInputRef.current?.focus();
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const result = await login(phone, password);
      
      if (result.success) {
        // Redirect to appropriate page
        const destination = location.state?.redirect || result.redirectTo || '/main';
        history.replace(destination);
      } else {
        setError(result.error || 'Ошибка входа');
      }
    } catch (err) {
      setError('Произошла ошибка. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  }, [phone, password, login, history, location.state]);

  // Handle demo login
  const handleDemoLogin = useCallback(async (type: keyof typeof DEMO_CREDENTIALS) => {
    const creds = DEMO_CREDENTIALS[type];
    setPhone(creds.phone);
    setPassword(creds.password);
    
    setLoading(true);
    try {
      const result = await login(creds.phone, creds.password);
      if (result.success) {
        history.replace(result.redirectTo || '/main');
      } else {
        setError(result.error || 'Ошибка входа');
      }
    } finally {
      setLoading(false);
    }
  }, [login, history]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e as any);
    }
  }, [handleSubmit]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Safe area padding */}
      <div className="pt-safe" />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <span className="text-4xl">💪</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Trainer OS</h1>
          <p className="text-gray-400 text-sm">Персональные тренировки</p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-4"
        >
          {/* Phone input */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <PhoneIcon className="w-5 h-5" />
            </div>
            <input
              ref={phoneInputRef}
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              onKeyPress={handleKeyPress}
              placeholder="+7 (XXX) XXX-XXXX"
              autoComplete="tel"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all"
            />
          </div>

          {/* Password input */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <LockClosedIcon className="w-5 h-5" />
            </div>
            <input
              ref={passwordInputRef}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              onKeyPress={handleKeyPress}
              placeholder="Пароль"
              autoComplete="current-password"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-12 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Error message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="flex items-center gap-2 text-rose-400 text-sm px-1"
              >
                <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #A64D55 0%, #8B3A42 100%)',
            }}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <>
                <span>Войти</span>
                <ArrowRightIcon className="w-4 h-4" />
              </>
            )}
          </motion.button>

          {/* Helper text */}
          <p className="text-center text-gray-500 text-xs">
            Новый пользователь? Аккаунт будет создан автоматически
          </p>
        </motion.form>

        {/* Demo accounts section (development only) */}
        {import.meta.env.DEV && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 w-full max-w-sm"
          >
            <div className="relative flex items-center mb-4">
              <div className="flex-1 border-t border-white/10" />
              <span className="px-3 text-xs text-gray-500">Demo аккаунты</span>
              <div className="flex-1 border-t border-white/10" />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(DEMO_CREDENTIALS).map(([key, { label }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleDemoLogin(key as keyof typeof DEMO_CREDENTIALS)}
                  disabled={loading}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="pb-safe px-6 py-4 text-center">
        <p className="text-gray-600 text-xs">
          © {new Date().getFullYear()} Trainer OS. Все права защищены.
        </p>
      </div>
    </div>
  );
};

export default LoginV2;
