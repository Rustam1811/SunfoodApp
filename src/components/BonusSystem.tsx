import React, { useState, useEffect } from 'react';
import { firestore, auth } from '../firebase/firebase';

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
            date: data.createdAt.toDate().toLocaleDateString(),
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
    <div className="p-4">
      <h2 className="text-xl font-bold">Бонусная система</h2>
      <p className="mt-2">
        Ваши бонусные баллы:{" "}
        <span className="font-semibold text-green-600">{bonusPoints}</span>
      </p>
      <h3 className="text-lg font-bold mt-4">История заказов</h3>
      <ul className="mt-2">
        {orders.map(order => (
          <li key={order.id} className="border-b py-2">
            Заказ #{order.id} от {order.date}: Сумма {order.amount}₽, бонусов:{" "}
            {order.bonusEarned}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BonusSystem;
