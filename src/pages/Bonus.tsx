import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { firestore } from '../firebase/firebase';
import { FaCoins, FaMedal, FaGift, FaChartLine, FaLock } from 'react-icons/fa';

interface Order {
  id: string;
  date: string;
  amount: number;
  bonusEarned: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  icon: JSX.Element;
  secret?: boolean;
}

const Bonus: React.FC = () => {
  const [bonusPoints, setBonusPoints] = useState<number>(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const navigate = useHistory();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = firestore
      .collection('orders')
      .where('userId', '==', user.phone) // 🔁 мы используем phone, а не uid
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        let totalBonus = 0;
        const ordersData: Order[] = [];

        snapshot.forEach(doc => {
          const data = doc.data();
          totalBonus += data.bonusEarned || 0;
          ordersData.push({
            id: doc.id,
            date: data.createdAt?.toDate().toLocaleDateString() || 'Неизвестно',
            amount: data.amount || 0,
            bonusEarned: data.bonusEarned || 0,
          });
        });

        setBonusPoints(totalBonus);
        setOrders(ordersData);
        checkAchievements(ordersData, totalBonus);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [user]);

  const checkAchievements = (ordersData: Order[], totalBonus: number) => {
    const unlocked: Achievement[] = [
      {
        id: 'first_order',
        name: 'Первый заказ',
        description: 'Совершите первый заказ',
        unlocked: ordersData.length >= 1,
        icon: <FaMedal className="text-black text-4xl" />
      },
      {
        id: 'five_orders',
        name: '5 заказов',
        description: 'Совершите 5 заказов',
        unlocked: ordersData.length >= 5,
        icon: <FaGift className="text-black text-4xl" />
      },
      {
        id: 'thousand_points',
        name: '1000 баллов',
        description: 'Наберите 1000 бонусных баллов',
        unlocked: totalBonus >= 1000,
        icon: <FaChartLine className="text-black text-4xl" />
      },
      {
        id: 'secret_big_spender',
        name: 'Секретный: Большой чек',
        description: 'Сделайте заказ больше 5000₸',
        unlocked: ordersData.some(order => order.amount >= 5000),
        icon: <FaLock className="text-black text-4xl" />,
        secret: true
      },
      {
        id: 'secret_night_order',
        name: 'Секретный: Ночной гость',
        description: 'Сделайте заказ между 00:00 и 05:00',
        unlocked: ordersData.some(order => {
          const orderDate = new Date(order.date);
          const hour = orderDate.getHours();
          return hour >= 0 && hour < 5;
        }),
        icon: <FaLock className="text-black text-4xl" />,
        secret: true
      }
    ];
    setAchievements(unlocked);
  };

  if (!user) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg text-center">
        <p className="text-lg font-semibold">Войдите в аккаунт для просмотра бонусов ☕</p>
      </div>
    );
  }

  return (
    <div className='max-h-[90vh] overflow-auto p-4 bg-white'>
      <div className="p-8 bg-white rounded-3xl shadow-2xl max-w-4xl mx-auto">
        <h2 className="text-4xl font-extrabold text-black mb-8 flex items-center gap-3">✨ Бонусная система</h2>

        <div className="relative bg-white rounded-3xl p-10 shadow-inner text-black overflow-hidden mb-10 hover:scale-105 transition-transform duration-300">
          <FaCoins className="absolute text-black text-[200px] right-[-30px] top-[-30px] opacity-20 rotate-12" />
          <p className="text-2xl">Ваши бонусы</p>
          <p className="text-6xl font-bold mt-4 drop-shadow-lg text-black">{bonusPoints} 💎</p>
          <button
            onClick={() => navigate.push('/order')}
            className="mt-6 bg-black text-white font-bold px-6 py-3 rounded-full shadow-lg hover:bg-gray-700 transition-all"
          >
            🎁 Потратить бонусы
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-10">
          <h3 className="text-3xl font-semibold text-black mb-6">📈 Прогресс</h3>
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
            <div className="bg-black h-6 text-right pr-4 font-bold text-white shadow-inner"
              style={{ width: `${Math.min(bonusPoints, 1000) / 10}%` }}>
              {bonusPoints} / 1000
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-10">
          <h3 className="text-3xl font-semibold text-black mb-6">🏆 Достижения</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {achievements.map(ach => (
              <div
                key={ach.id}
                className={`p-6 rounded-2xl shadow-lg flex flex-col items-center 
                  ${ach.unlocked
                    ? 'bg-gradient-to-br from-green-100 to-green-200'
                    : 'bg-gradient-to-br from-gray-100 to-gray-200'} 
                  hover:scale-[1.02] transition-transform duration-300`}
              >
                {ach.icon}
                <p
                  className={`font-semibold text-center mt-3 
                    ${ach.unlocked ? 'text-green-800' : 'text-black'} 
                    ${ach.secret && !ach.unlocked ? 'text-gray-500' : ''}`}
                >
                  {ach.secret && !ach.unlocked ? '???' : ach.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h3 className="text-3xl font-semibold text-black mb-6">🧾 История заказов</h3>
          {loading ? (
            <p className="text-gray-500">Загружаем...</p>
          ) : orders.length === 0 ? (
            <p className="text-gray-500">Нет заказов.</p>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order.id} className="bg-white p-6 rounded-2xl shadow-md hover:scale-[1.02] transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-semibold text-black">#{order.id.slice(0, 6)}</span>
                    <span className="text-gray-500">{order.date}</span>
                  </div>
                  <div className="flex justify-between text-black">
                    <div>💸 Сумма: <span className="font-bold">{order.amount}₸</span></div>
                    <div>💎 Бонус: <span className="font-bold text-black">+{order.bonusEarned}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bonus;
