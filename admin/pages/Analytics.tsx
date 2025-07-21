import React, { useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { ChartBarIcon, ClockIcon, FireIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { OrdersLineChart, TopProductsBarChart, OrdersByHourBarChart } from '../components/AnalyticsCharts';

const periodOptions = [
  { key: 'day', label: 'День' },
  { key: 'week', label: 'Неделя' },
  { key: 'month', label: 'Месяц' }
];

const Analytics: React.FC = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const { aggregated, loading, error, refresh } = useAnalytics(period);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <ChartBarIcon className="h-8 w-8 text-amber-400" />
        <h1 className="text-2xl font-bold text-white">Аналитика продаж</h1>
        <div className="ml-auto flex gap-2">
          {periodOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setPeriod(opt.key as any)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${period === opt.key ? 'bg-amber-500 text-black shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              {opt.label}
            </button>
          ))}
          <button onClick={refresh} className="px-4 py-2 rounded-xl bg-blue-500 text-white font-semibold flex items-center gap-2">
            <ArrowPathIcon className="h-5 w-5" />
            Обновить
          </button>
        </div>
      </div>

      {loading && <div className="text-white">Загрузка...</div>}
      {error && <div className="text-red-400">{error}</div>}
      {aggregated && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <FireIcon className="h-6 w-6 text-amber-400" />
              <span className="text-lg font-bold text-white">Выручка</span>
            </div>
            <div className="text-3xl font-extrabold text-white">{aggregated.totalRevenue.toLocaleString('ru-RU')} ₸</div>
            <div className="text-gray-300 mt-2">Всего заказов: {aggregated.totalOrders}</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <ClockIcon className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-bold text-white">Пиковые часы</span>
            </div>
            <div className="text-white">{getPeakHours(aggregated.byHour)}</div>
            <div className="text-gray-300 mt-2">Заказов по часам: {(Object.values(aggregated.byHour) as number[]).reduce((a, b) => a + b, 0)}</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <ChartBarIcon className="h-6 w-6 text-green-400" />
              <span className="text-lg font-bold text-white">Топ товаров</span>
            </div>
            <ul className="mt-2 space-y-1">
              {aggregated.topProducts.slice(0, 5).map((p, idx) => (
                <li key={idx} className="text-white flex justify-between">
                  <span>{p.name}</span>
                  <span className="text-amber-400 font-bold">{p.qty} шт</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {aggregated && (
        <div className="bg-white/10 rounded-2xl p-6 border border-white/20 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Динамика заказов по дням</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-white">
              <thead>
                <tr>
                  <th className="text-left py-2 px-4">Дата</th>
                  <th className="text-left py-2 px-4">Заказов</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(aggregated.byDay).map(([day, count]) => (
                  <tr key={day}>
                    <td className="py-2 px-4">{day}</td>
                    <td className="py-2 px-4">{String(count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {aggregated && (
        <div className="bg-white/10 rounded-2xl p-6 border border-white/20 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Топ категорий</h2>
          <ul className="space-y-2">
            {aggregated.topCategories.map((cat, idx) => (
              <li key={idx} className="flex justify-between text-white">
                <span>{cat.category}</span>
                <span className="text-green-400 font-bold">{cat.qty} шт</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {aggregated && (
        <OrdersLineChart data={aggregated.byDay} />
      )}
      {aggregated && (
        <TopProductsBarChart data={aggregated.topProducts} />
      )}
      {aggregated && (
        <OrdersByHourBarChart data={aggregated.byHour} />
      )}

      {/* TODO: добавить фильтры, экспорт */}
    </div>
  );
};

function getPeakHours(byHour: Record<string, number>) {
  const sorted = Object.entries(byHour).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return 'Нет данных';
  return sorted.slice(0, 3).map(([hour, count]) => `${hour}:00 (${count})`).join(', ');
}

export default Analytics;
