/**
 * Login Page - Trainer OS
 * 
 * Simple phone + password authentication.
 * 
 * @module pages/Login
 */

import React, { useState, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../auth/AuthContextV2';

interface LocationState {
  redirect?: string;
}

const Login: React.FC = () => {
  const history = useHistory();
  const location = useLocation<LocationState>();
  const { login } = useAuth();
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await login(phone, password);
      
      if (result.success) {
        // For staff (admin/coach) always use the role-based redirect
        // For clients, allow saved redirect from location.state
        const isStaffRedirect = result.redirectTo === '/admin' || result.redirectTo === '/coach/clients';
        const redirect = isStaffRedirect 
          ? result.redirectTo 
          : (location.state?.redirect || result.redirectTo || '/main');
        history.replace(redirect);
      } else {
        setError(result.error || 'Ошибка входа');
      }
    } catch (err) {
      setError('Произошла ошибка');
    } finally {
      setLoading(false);
    }
  }, [phone, password, login, history, location.state]);
  
  return (
    <div className="min-h-screen bg-tr-base flex flex-col items-center justify-center px-6">
      {/* Logo/Brand */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-tr-text mb-2">Trainer OS</h1>
        <p className="text-tr-text-secondary text-sm">Персональные тренировки</p>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Номер телефона"
            className="w-full bg-tr-input border border-tr-border rounded-xl px-4 py-4 text-tr-text placeholder-tr-text-disabled focus:outline-none focus:border-tr-accent transition-colors"
            required
          />
        </div>
        
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="w-full bg-tr-input border border-tr-border rounded-xl px-4 py-4 text-tr-text placeholder-tr-text-disabled focus:outline-none focus:border-tr-accent transition-colors"
            required
          />
        </div>
        
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-tr-error text-sm text-center"
          >
            {error}
          </motion.p>
        )}
        
        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-xl font-semibold text-white transition-opacity disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #A64D55 0%, #8B3A42 100%)',
          }}
        >
          {loading ? 'Вход...' : 'Войти'}
        </motion.button>
      </form>
      
      <p className="mt-8 text-tr-text-muted text-sm text-center">
        Новый пользователь? Введите данные для регистрации.
      </p>
    </div>
  );
};

export default Login;
