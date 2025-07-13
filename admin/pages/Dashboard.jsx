import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
const Dashboard = () => {
    const { user } = useContext(UserContext);
    const stats = [
        { label: 'Новые заказы сегодня', value: 24, roles: ['owner', 'admin'] },
        { label: 'Продажи сегодня', value: '₸34,000', roles: ['owner'] },
        { label: 'Общая выручка', value: '₸1,200,000', roles: ['owner'] },
    ];
    return (<div className="p-4">
      <h1 className="text-2xl font-semibold mb-6">Панель управления</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {stats
            .filter((stat) => stat.roles.includes(user.role))
            .map((stat) => (<div key={stat.label} className="bg-white rounded-2xl p-4 shadow">
              <p className="text-sm font-medium">{stat.label}</p>
              <p className="mt-2 text-xl font-bold">{stat.value}</p>
            </div>))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Последние заказы</h2>
        <ul className="space-y-2">
          {/* Пример статических заказов - заменить на динамические данные */}
          <li className="flex justify-between bg-white p-4 rounded-2xl shadow">
            <span>Заказ #1024</span>
            <span>₸450</span>
          </li>
          <li className="flex justify-between bg-white p-4 rounded-2xl shadow">
            <span>Заказ #1023</span>
            <span>₸1,200</span>
          </li>
        </ul>
      </div>
    </div>);
};
export default Dashboard;
// Как сделать ещё круче:
// 1. Извлечь карточку статистики в переиспользуемый компонент Card для консистентного стиля.
// 2. Подключить библиотеку Recharts или Chart.js для визуализации динамических графиков выручки.
// 3. Использовать React Query или SWR для асинхронной подгрузки данных и кеширования.
// 4. Добавить переключатель темной/светлой темы (dark mode) с сохранением в localStorage.
// 5. Внедрить WebSocket для реального обновления заказов и статистики в режиме реального времени.
