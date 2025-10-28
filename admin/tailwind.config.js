module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Основная палитра
        'admin-primary': '#3B82F6', // Синий для основных элементов
        'admin-secondary': '#8B5CF6', // Фиолетовый для акцентов
        'admin-success': '#10B981', // Зеленый для успеха
        'admin-warning': '#F59E0B', // Оранжевый для предупреждений
        'admin-danger': '#EF4444', // Красный для опасности
        'admin-info': '#06B6D4', // Голубой для информации
        
        // Фоны
        'admin-bg-primary': '#F8FAFC', // Основной фон
        'admin-bg-secondary': '#FFFFFF', // Белый фон карточек
        'admin-bg-dark': '#1E293B', // Темный фон
        'admin-bg-gray': '#F1F5F9', // Серый фон
        
        // Текст
        'admin-text-primary': '#1E293B', // Основной текст
        'admin-text-secondary': '#64748B', // Вторичный текст
        'admin-text-muted': '#94A3B8', // Приглушенный текст
        'admin-text-white': '#FFFFFF', // Белый текст
        
        // Границы
        'admin-border': '#E2E8F0', // Основные границы
        'admin-border-dark': '#CBD5E1', // Темные границы
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'admin': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'admin-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'admin-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.4s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce-subtle 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
        },
        '.scrollbar-thumb-slate-300': {
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#cbd5e1',
            borderRadius: '0.25rem',
          },
        },
        '.scrollbar-track-transparent': {
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
        },
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
};
