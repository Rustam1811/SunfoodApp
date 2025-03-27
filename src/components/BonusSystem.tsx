import React, { useState, useEffect } from 'react';
import { firestore, auth, FieldValue } from '../firebase/firebase';

interface Order {
  id: string;
  date: string;
  amount: number;
  bonusEarned: number;
}

const BonusSystem: React.FC = () => {
  const [bonusPoints, setBonusPoints] = useState<number>(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    const unsubscribe = firestore
      .collection('orders')
      .where('userId', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        let totalBonus = 0;
        const ordersData: Order[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          totalBonus += data.bonusEarned;
          ordersData.push({
            id: doc.id,
            date: data.createdAt?.toDate().toLocaleDateString() || 'Неизвестно',
            amount: data.amount,
            bonusEarned: data.bonusEarned,
          });
        });
        setBonusPoints(totalBonus);
        setOrders(ordersData);
      });
    return () => unsubscribe();
  }, [user]);

  return (
    <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Бонусная система</h2>

      <div className="bg-gray-900 text-white p-4 rounded-lg text-center text-lg">
        Ваши бонусные баллы: <span className="font-bold text-yellow-400">{bonusPoints}</span>
      </div>

      <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800">История заказов</h3>
      <ul className="space-y-4">
        {orders.map(order => (
          <li
            key={order.id}
            className="bg-gray-50 rounded-lg p-4 shadow transition transform hover:scale-105"
          >
            <p className="text-gray-800 font-medium">Заказ #{order.id}</p>
            <p className="text-sm text-gray-500">от {order.date}</p>
            <p className="mt-2">
              Сумма: <span className="font-semibold text-gray-800">{order.amount}₸</span>
            </p>
            <p>
              Бонусов начислено:{' '}
              <span className="font-semibold text-gray-800">{order.bonusEarned}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BonusSystem;

// Функция для добавления заказа и начисления бонусов
export const addOrderWithBonus = async (amount: number, userId: string) => {
  const bonusEarned = Math.floor(amount * 0.05); // 5% от суммы заказа
  try {
    await firestore.collection('orders').add({
      userId,
      amount,
      bonusEarned,
      createdAt: FieldValue.serverTimestamp(),
    });
    console.log(`✅ Заказ добавлен. Начислено ${bonusEarned} бонусов.`);
  } catch (error) {
    console.error('❌ Ошибка при добавлении заказа:', error);
  }
};
