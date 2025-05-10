import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

interface Sale {
  id: number;
  date: string;
  total: number;
}

const Sales: React.FC = () => {
  const { user } = useContext(UserContext);

  const sales: Sale[] = [
    { id: 1, date: '2025-04-25', total: 4500 },
    { id: 2, date: '2025-04-24', total: 6700 },
    { id: 3, date: '2025-04-23', total: 5200 },
  ];

  if (user.role !== 'owner') {
    return (
      <div className="p-4">
        <p className="text-red-500 font-medium">У вас нет доступа к этим данным.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-6">Продажи</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow">
          <p className="text-sm font-medium">Продажи сегодня</p>
          <p className="mt-2 text-xl font-bold">₸12,500</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow">
          <p className="text-sm font-medium">Продажи за неделю</p>
          <p className="mt-2 text-xl font-bold">₸85,000</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow">
          <p className="text-sm font-medium">Продажи за месяц</p>
          <p className="mt-2 text-xl font-bold">₸340,000</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Последние транзакции</h2>
        <ul className="space-y-2">
          {sales.map((sale) => (
            <li key={sale.id} className="flex justify-between bg-white p-4 rounded-2xl shadow">
              <span>{sale.date}</span>
              <span className="font-bold">₸{sale.total}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sales;

// Как сделать ещё круче:
// 1. Вынести карточки статистики в переиспользуемый компонент StatCard.
// 2. Интегрировать график выручки (Recharts или Chart.js).
// 3. Подключить React Query для загрузки данных с API и кеширования.
// 4. Добавить фильтрацию и пагинацию списка транзакций.
// 5. Внедрить WebSocket для live-обновлений продаж.
