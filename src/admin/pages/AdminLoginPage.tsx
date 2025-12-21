/**
 * Admin Login Page - Coach/Admin authentication
 * 
 * Uses AuthContextV2 with role checks.
 * Redirects non-coach/admin users.
 * 
 * @module admin/pages/AdminLoginPage
 */

import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, PhoneIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../auth/AuthContextV2';
import { Button, Input, Card } from '../components/FormComponents';

// ============================================================================
// Types
// ============================================================================

interface LocationState {
  from?: { pathname: string };
}

// ============================================================================
// Phone Formatter
// ============================================================================

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  
  if (digits.length === 0) return '';
  if (digits.length <= 1) return `+${digits}`;
  if (digits.length <= 4) return `+${digits.slice(0, 1)} (${digits.slice(1)}`;
  if (digits.length <= 7) return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  if (digits.length <= 9) return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
}

function parsePhone(formatted: string): string {
  const digits = formatted.replace(/\D/g, '');
  return digits.length >= 11 ? `+${digits}` : '';
}

// ============================================================================
// Main Component
// ============================================================================

export const AdminLoginPage: React.FC = () => {
  const { login, user, loading, canAccessCoach, canAccessAdmin } = useAuth();
  const history = useHistory();
  const location = useLocation<LocationState>();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in as coach/admin
  useEffect(() => {
    if (!loading && user) {
      if (canAccessCoach || canAccessAdmin) {
        const from = location.state?.from?.pathname || '/admin';
        history.replace(from);
      } else {
        // User is logged in but not coach/admin
        setError('Доступ только для тренеров и администраторов');
      }
    }
  }, [loading, user, canAccessCoach, canAccessAdmin, history, location]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const phoneNumber = parsePhone(phone);
    if (!phoneNumber) {
      setError('Введите корректный номер телефона');
      return;
    }
    if (!password) {
      setError('Введите пароль');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await login(phoneNumber, password);
      
      if (!result.success) {
        setError(result.error || 'Ошибка входа');
        return;
      }

      // Check role after login
      // The useEffect will handle redirect
    } catch (err) {
      setError('Произошла ошибка. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo accounts for development
  const fillDemoCoach = () => {
    setPhone(formatPhone('77770002222'));
    setPassword('coach123');
  };

  const fillDemoAdmin = () => {
    setPhone(formatPhone('77001234567'));
    setPassword('admin123');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tr-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-tr-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tr-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-tr-accent mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">T</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Панель тренера</h1>
          <p className="text-tr-text-muted mt-1">Вход для тренеров и администраторов</p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-tr-text-muted mb-2">
                Телефон
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tr-text-muted" />
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="+7 (___) ___-__-__"
                  className="w-full bg-tr-input border border-tr-border rounded-tr-md pl-10 pr-4 py-3 text-white placeholder-tr-text-disabled focus:outline-none focus:border-tr-accent"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-tr-text-muted mb-2">
                Пароль
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tr-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Введите пароль"
                  className="w-full bg-tr-input border border-tr-border rounded-tr-md pl-10 pr-12 py-3 text-white placeholder-tr-text-disabled focus:outline-none focus:border-tr-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-tr-text-muted hover:text-white"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-tr-error/20 border border-tr-error/50 rounded-tr-md text-tr-error text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <Button type="submit" fullWidth loading={isLoading} size="lg">
              Войти
            </Button>
          </form>

          {/* Demo accounts (dev only) */}
          {import.meta.env.DEV && (
            <div className="mt-6 pt-4 border-t border-tr-border">
              <p className="text-xs text-tr-text-disabled text-center mb-3">
                Тестовые аккаунты (только dev)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={fillDemoCoach}
                >
                  🏋️ Тренер
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={fillDemoAdmin}
                >
                  👑 Админ
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Back link */}
        <p className="text-center mt-6">
          <button
            onClick={() => history.push('/login')}
            className="text-tr-text-muted hover:text-white text-sm"
          >
            ← Вернуться на главную
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
