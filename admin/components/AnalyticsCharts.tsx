import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

interface OrdersByDayData {
  [date: string]: { orders: number; revenue: number };
}

interface ChartDataItem {
  name: string;
  orders: number;
  revenue: number;
  date?: string;
  weekStart?: string;
  monthStart?: string;
}

interface TopProduct {
  productName: string;
  quantity: number;
  totalRevenue: number;
}

/**
 * График динамики заказов по периодам (день/неделя/месяц)
 */
export function OrdersLineChart({ data, periodLabel }: { data: ChartDataItem[] | OrdersByDayData, periodLabel?: string }) {
  // Обрабатываем данные в зависимости от формата
  let chartData: any[];
  
  if (Array.isArray(data)) {
    // Новый формат - массив с данными по периодам
    chartData = data.map(item => ({
      name: item.name,
      orders: item.orders || 0,
      revenue: item.revenue || 0
    }));
  } else {
    // Старый формат - объект по дням
    chartData = Object.entries(data || {}).map(([date, info]) => ({
      name: new Date(date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }),
      orders: info.orders || 0,
      revenue: info.revenue || 0
    }));
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="name" 
          stroke="#6b7280" 
          fontSize={12}
          tick={{ fontSize: 10 }}
          interval="preserveStartEnd"
        />
        <YAxis stroke="#6b7280" fontSize={12} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #d1d5db', 
            borderRadius: '8px',
            fontSize: '14px'
          }} 
          labelStyle={{ color: '#374151' }}
          formatter={(value: number, name: string) => [
            name === 'orders' ? `${value} заказов` : `${value.toLocaleString()} ₽`,
            name === 'orders' ? 'Заказы' : 'Доход'
          ]}
          labelFormatter={(label) => `${periodLabel || 'Период'}: ${label}`}
        />
        <Line 
          type="monotone" 
          dataKey="orders" 
          stroke="#3b82f6" 
          strokeWidth={3}
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: '#1d4ed8' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/**
 * График топ товаров
 */
export function TopProductsBarChart({ data }: { data: TopProduct[] }) {
  const chartData = (data || []).slice(0, 8).map(product => ({
    name: product.productName && product.productName.length > 15 ? 
      product.productName.substring(0, 15) + '...' : 
      product.productName || 'Неизвестно',
    quantity: product.quantity || 0,
    revenue: product.totalRevenue || 0
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="name" 
          stroke="#6b7280" 
          fontSize={10}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis stroke="#6b7280" fontSize={12} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #d1d5db', 
            borderRadius: '8px',
            fontSize: '14px'
          }}
          labelStyle={{ color: '#374151' }}
        />
        <Bar 
          dataKey="quantity" 
          fill="#f59e0b" 
          name="Количество"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * График активности по часам
 */
export function OrdersByHourBarChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data || {})
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([hour, count]) => ({ 
      hour: `${hour}:00`, 
      count: count || 0
    }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="hour" 
          stroke="#6b7280" 
          fontSize={12}
        />
        <YAxis stroke="#6b7280" fontSize={12} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #d1d5db', 
            borderRadius: '8px',
            fontSize: '14px'
          }}
          labelStyle={{ color: '#374151' }}
        />
        <Bar 
          dataKey="count" 
          fill="#6366f1" 
          name="Заказов"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
