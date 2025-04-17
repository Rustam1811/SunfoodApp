// src/components/BonusSystem.tsx
import React, { useState, useEffect } from 'react';

interface Order {
  id: string;
  date: string;
  amount: number;
  bonusEarned: number;
}

const BonusSystem: React.FC = () => {
  const [bonusPoints, setBonusPoints] = useState<number>(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Пользовательские данные из localStorage
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const userId = user?.uid || user?.phone;

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        // 1) Получаем текущее кол-во бонусов
        const bonusRes = await fetch(`/api/bonuses?phone=${encodeURIComponent(userId)}`);
        if (!bonusRes.ok) throw new Error('Не удалось загрузить бонусы');
        const { bonus } = await bonusRes.json();
        setBonusPoints(bonus);

        // 2) Получаем историю заказов
        const ordersRes = await fetch(`/api/orders?userId=${encodeURIComponent(userId)}`);
        if (!ordersRes.ok) throw new Error('Не удалось загрузить заказы');
        const ordersData: Order[] = await ordersRes.json();
        setOrders(ordersData);
      } catch (e) {
        console.error('🔥 Ошибка в BonusSystem:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (!userId) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg text-center">
        <p className="text-lg font-semibold">Войдите, чтобы видеть бонусы ☕</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg text-center">
        <p className="text-lg text-gray-500">Загрузка бонусов...</p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Бонусная система</h2>

      <div className="bg-gray-900 text-white p-4 rounded-lg text-center text-lg mb-6">
        Ваши бонусные баллы:{' '}
        <span className="font-bold text-yellow-400">{bonusPoints}</span>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-gray-800">История заказов</h3>
      {orders.length === 0 ? (
        <p className="text-gray-500">Заказов пока нет.</p>
      ) : (
        <ul className="space-y-4 max-h-64 overflow-auto">
          {orders.map(order => (
            <li
              key={order.id}
              className="bg-gray-50 rounded-lg p-4 shadow transition-transform hover:scale-105"
            >
              <p className="text-gray-800 font-medium">Заказ #{order.id}</p>
              <p className="text-sm text-gray-500">от {order.date}</p>
              <p className="mt-2">
                Сумма:{' '}
                <span className="font-semibold text-gray-800">
                  {order.amount}₸
                </span>
              </p>
              <p>
                Начислено бонусов:{' '}
                <span className="font-semibold text-gray-800">
                  {order.bonusEarned}
                </span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BonusSystem;