import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });      

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Ошибка входа');
      } else {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        history.push('/menu'); // ✅ редирект на меню
      }
    } catch (e) {
      setError('Ошибка сети. Попробуйте позже.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Фоновый градиент с анимацией */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-900 to-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      />
      {/* Форма логина */}
      <motion.div
        className="relative z-10 w-full max-w-md p-8 bg-white bg-opacity-95 rounded-xl shadow-2xl"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Logo" className="w-20 h-20" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
          Войти в систему
        </h2>
        {error && <div className="mb-4 text-center text-red-600">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-800 mb-2">
              Номер телефона
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Введите номер телефона"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-800 mb-2">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-700 transition duration-200"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-700 text-sm">
          Нет аккаунта?{' '}
          <a href="/register" className="text-gray-900 underline">
            Зарегистрируйтесь
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
