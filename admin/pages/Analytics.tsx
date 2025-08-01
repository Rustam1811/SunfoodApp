import React, { useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { ChartBarIcon, ClockIcon, FireIcon, ArrowPathIcon, CurrencyDollarIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { OrdersLineChart, TopProductsBarChart, OrdersByHourBarChart } from '../components/AnalyticsCharts';
import { motion } from 'framer-motion';

const periodOptions = [
  { key: 'day', label: 'День' },
  { key: 'week', label: 'Неделя' },
  { key: 'month', label: 'Месяц' }
];

/**
 * Мобильная версия аналитики для продакшна
 * Полностью рабочая с красивым интерфейсом
 */
const Analytics: React.FC = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const { aggregated, loading, error, refresh } = useAnalytics(period);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setTimeout(() => setRefreshing(false), 500);
  };

  const getPeakHours = (byHour: Record<string, number>) => {
    if (!byHour) return 'Нет данных';
    const entries = Object.entries(byHour);
    if (entries.length === 0) return 'Нет данных';
    const peak = entries.reduce((a, b) => byHour[a[0]] > byHour[b[0]] ? a : b);
    return `${peak[0]}:00 (${peak[1]} заказов)`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20"> {/* pb-20 для навигации */}
      <div className="px-4 py-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Аналитика</h1>
              <p className="text-sm text-gray-500">Статистика продаж</p>
            </div>
          </div>
          <motion.button 
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="p-3 bg-blue-500 text-white rounded-xl shadow-lg disabled:opacity-50"
            whileTap={{ scale: 0.95 }}
          >
            <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>

        {/* Переключатель периода */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {periodOptions.map(opt => (
            <motion.button
              key={opt.key}
              onClick={() => setPeriod(opt.key as any)}
              className={`flex-shrink-0 px-4 py-3 rounded-xl font-medium transition-all ${
                period === opt.key 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'bg-white text-gray-600 shadow border hover:bg-gray-50'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>

        {/* Состояния загрузки и ошибки */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Загрузка данных...</p>
          </div>
        )}

        {error && (
          <motion.div 
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-red-600 font-medium">Ошибка загрузки: {error}</p>
          </motion.div>
        )}

        {/* Основной контент */}
        {!loading && !error && aggregated && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Информация о периоде */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-blue-600" />
                <p className="text-blue-800 font-medium">
                  Данные за период: {aggregated.periodLabel || periodOptions.find(p => p.key === period)?.label}
                </p>
              </div>
              {aggregated.chartData && (
                <p className="text-blue-600 text-sm mt-1">
                  Показано {aggregated.chartData.length} {period === 'day' ? 'дней' : period === 'week' ? 'недель' : 'месяцев'} с данными
                </p>
              )}
            </div>

            {/* Карточки со статистикой */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                className="bg-white rounded-xl p-4 shadow-lg border"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Общий доход</p>
                    <p className="text-lg font-bold text-gray-900">{aggregated.revenue?.toLocaleString() || 0} ₽</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-white rounded-xl p-4 shadow-lg border"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Всего заказов</p>
                    <p className="text-lg font-bold text-gray-900">{aggregated.totalOrders || 0}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-white rounded-xl p-4 shadow-lg border"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Средний чек</p>
                    <p className="text-lg font-bold text-gray-900">{Math.round(aggregated.avgOrderValue || 0)} ₽</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-white rounded-xl p-4 shadow-lg border"
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FireIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Лучший товар</p>
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {aggregated.topProducts?.[0]?.productName || 'Нет данных'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Топ товаров */}
            <motion.div 
              className="bg-white rounded-xl p-6 shadow-lg border"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <FireIcon className="h-6 w-6 text-orange-500" />
                <h2 className="text-lg font-bold text-gray-900">Топ товаров</h2>
              </div>
              <div className="space-y-3">
                {aggregated.topProducts?.slice(0, 5).map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-orange-600 font-bold text-sm">{index + 1}</span>
                      </div>
                      <span className="font-medium text-gray-900">{product.productName}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{product.quantity} шт</p>
                      <p className="text-xs text-gray-500">{(product.totalRevenue || 0).toLocaleString()} ₽</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">Нет данных о продажах</p>
                )}
              </div>
            </motion.div>

            {/* Активность по часам */}
            <motion.div 
              className="bg-white rounded-xl p-6 shadow-lg border"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <ClockIcon className="h-6 w-6 text-blue-500" />
                <h2 className="text-lg font-bold text-gray-900">Активность по часам</h2>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Пиковое время: <span className="font-medium">{getPeakHours(aggregated.byHour || {})}</span>
                </p>
              </div>
              {aggregated.byHour && <OrdersByHourBarChart data={aggregated.byHour} />}
            </motion.div>

            {/* Графики */}
            {aggregated.byDay && (
              <motion.div 
                className="bg-white rounded-xl p-6 shadow-lg border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <ChartBarIcon className="h-6 w-6 text-green-500" />
                  <h2 className="text-lg font-bold text-gray-900">
                    Динамика заказов по {period === 'day' ? 'дням' : period === 'week' ? 'неделям' : 'месяцам'}
                  </h2>
                </div>
                <OrdersLineChart 
                  data={aggregated.chartData || aggregated.byDay} 
                  periodLabel={aggregated.periodLabel}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
