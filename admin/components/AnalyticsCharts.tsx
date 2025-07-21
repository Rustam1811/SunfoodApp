import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';

export function OrdersLineChart({ data }) {
  const chartData = Object.entries(data).map(([date, count]) => ({ date, count }));
  return (
    <div className="bg-white/10 rounded-2xl p-6 border border-white/20 mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Динамика заказов по дням</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke="#fff" />
          <YAxis stroke="#fff" />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#fbbf24" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopProductsBarChart({ data }) {
  return (
    <div className="bg-white/10 rounded-2xl p-6 border border-white/20 mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Топ товаров</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data.slice(0, 10)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke="#fff" />
          <YAxis stroke="#fff" />
          <Tooltip />
          <Legend />
          <Bar dataKey="qty" fill="#fbbf24" name="Кол-во" />
          <Bar dataKey="revenue" fill="#34d399" name="Выручка" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OrdersByHourBarChart({ data }) {
  const chartData = Object.entries(data).map(([hour, count]) => ({ hour: `${hour}:00`, count }));
  return (
    <div className="bg-white/10 rounded-2xl p-6 border border-white/20 mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Заказы по часам</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" stroke="#fff" />
          <YAxis stroke="#fff" />
          <Tooltip />
          <Bar dataKey="count" fill="#6366f1" name="Заказов" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
