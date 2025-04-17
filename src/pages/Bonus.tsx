const API = import.meta.env.VITE_BACKEND_URL; // e.g. "https://coffee-addict.vercel.app/api"

import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
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
  const [bonusPoints, setBonusPoints] = useState(0);
  const [spendAmount, setSpendAmount] = useState(100); // по умолчанию 100
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const navigate = useHistory();

  // Получаем телефон из localStorage
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return;
    const u = JSON.parse(stored);
    setUserPhone(u.phone || null);
  }, []);

  // Загружаем бонусы и заказы, а потом считаем достижения
  useEffect(() => {
    if (!userPhone) return;
    setLoading(true);

    (async () => {
      let ords: Order[] = [];

      // 1) Получаем историю заказов по API
      try {
        const res = await fetch(`/api/orders?userId=${encodeURIComponent(userPhone)}`);
        if (!res.ok) throw new Error(`status ${res.status}`);
        // ожидаем, что сервер отдаёт { id, date, amount, bonusEarned }[]
        const raw = (await res.json()) as Array<{
          id: string;
          date: string;
          amount: number;
          bonusEarned: number;
        }>;

        // преобразуем дату и сразу сохраняем
        ords = raw.map(o => ({
          id: o.id,
          date: new Date(o.date).toLocaleString(),
          amount: o.amount,
          bonusEarned: o.bonusEarned,
        }));
        setOrders(ords);
      } catch (err) {
        console.error('Ошибка получения истории заказов:', err);
      }

      // 2) Считаем общий баланс по bonusEarned
      const totalBonus = ords.reduce((sum, o) => sum + o.bonusEarned, 0);
      setBonusPoints(totalBonus);

      // 3) Вычисляем достижения
      const unlocked: Achievement[] = [
        {
          id: 'first_order',
          name: 'Первый заказ',
          description: 'Совершите первый заказ',
          unlocked: ords.length >= 1,
          icon: <FaMedal className="text-black text-4xl" />,
        },
        {
          id: 'five_orders',
          name: '5 заказов',
          description: 'Совершите 5 заказов',
          unlocked: ords.length >= 5,
          icon: <FaGift className="text-black text-4xl" />,
        },
        {
          id: 'thousand_points',
          name: '1000 баллов',
          description: 'Наберите 1000 бонусных баллов',
          unlocked: totalBonus >= 1000,
          icon: <FaChartLine className="text-black text-4xl" />,
        },
        {
          id: 'secret_big_spender',
          name: 'Секретный: Большой чек',
          description: 'Сделайте заказ больше 5000₸',
          unlocked: ords.some(o => o.amount >= 5000),
          icon: <FaLock className="text-black text-4xl" />,
          secret: true,
        },
        {
          id: 'secret_night_order',
          name: 'Секретный: Ночной гость',
          description: 'Сделайте заказ между 00:00 и 05:00',
          unlocked: ords.some(o => {
            const hr = new Date(o.date).getHours();
            return hr >= 0 && hr < 5;
          }),
          icon: <FaLock className="text-black text-4xl" />,
          secret: true,
        },
      ];
      setAchievements(unlocked);

      setLoading(false);
    })();
  }, [userPhone]);

  const handleSpendBonuses = async () => {
    if (!userPhone) return;
    if (spendAmount < 1 || spendAmount > bonusPoints) {
      return alert(`Введите сумму от 1 до ${bonusPoints}`);
    }

    try {
      const res = await fetch(
        `${API}/spendBonuses`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: userPhone, amount: spendAmount })
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `status ${res.status}`);
      }
      setBonusPoints(data.bonus);
      alert(`🎁 Списание ${spendAmount} бонусов прошло успешно!`);
    } catch (err: any) {
      console.error("Ошибка списания бонусов:", err);
      alert(err.message);
    }
  };

  if (!userPhone) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg text-center">
        <p className="text-lg font-semibold">
          Войдите в аккаунт для просмотра бонусов ☕
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[90vh] overflow-auto p-4 bg-white">
      <div className="p-8 bg-white rounded-3xl shadow-2xl max-w-4xl mx-auto">
        <h2 className="text-4xl font-extrabold mb-8 flex items-center gap-3">
          ✨ Бонусная система
        </h2>

        {/* Баланс бонусов */}
        <div className="relative bg-white rounded-3xl p-10 shadow-inner text-black overflow-hidden mb-6">
          <FaCoins className="absolute text-black text-[200px] right-[-30px] top-[-30px] opacity-20 rotate-12" />
          <p className="text-2xl">Ваши бонусы</p>
          <p className="text-6xl font-bold mt-4 drop-shadow-lg text-black">
            {bonusPoints} 💎
          </p>

          <div className="mt-6 flex items-center justify-center gap-4">
            <input
              type="number"
              min={1}
              max={bonusPoints}
              value={spendAmount}
              onChange={e => setSpendAmount(Number(e.target.value))}
              className="w-24 p-2 border rounded-lg text-center"
            />
            <button
              onClick={handleSpendBonuses}
              className="bg-black text-white font-bold px-6 py-3 rounded-full shadow-lg hover:bg-gray-700 transition-all"
            >
              🎁 Потратить
            </button>
          </div>
        </div>

        {/* Прогресс */}
        <div className="rounded-3xl shadow-xl p-8 mb-10">
          <h3 className="text-3xl font-semibold mb-6">📈 Прогресс</h3>
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
            <div
              className="h-6 text-right pr-4 font-bold text-white"
              style={{
                width: `${Math.min(bonusPoints, 1000) / 10}%`,
                backgroundColor: '#000',
              }}
            >
              {bonusPoints} / 1000
            </div>
          </div>
        </div>

        {/* Достижения */}
        <div className="rounded-3xl shadow-xl p-8 mb-10">
          <h3 className="text-3xl font-semibold mb-6">🏆 Достижения</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {achievements.map(ach => (
              <div
                key={ach.id}
                className={`p-6 rounded-2xl shadow-lg flex flex-col items-center ${ach.unlocked
                    ? 'bg-gradient-to-br from-green-100 to-green-200'
                    : 'bg-gradient-to-br from-gray-100 to-gray-200'
                  }`}
              >
                {ach.icon}
                <p
                  className={`mt-3 font-semibold text-center ${ach.unlocked ? 'text-green-800' : 'text-gray-500'
                    } ${ach.secret && !ach.unlocked ? 'italic' : ''}`}
                >
                  {ach.secret && !ach.unlocked ? '???' : ach.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* История заказов */}
        <div className="rounded-3xl shadow-xl p-8">
          <h3 className="text-3xl font-semibold mb-6">🧾 История заказов</h3>
          {loading ? (
            <p className="text-gray-500">Загружаем...</p>
          ) : orders.length === 0 ? (
            <p className="text-gray-500">Нет заказов.</p>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <div
                  key={order.id}
                  className="p-6 rounded-2xl shadow-md hover:scale-[1.02] transition-all"
                >
                  <div className="flex justify-between mb-3">
                    <span className="font-semibold">#{order.id.slice(0, 6)}</span>
                    <span className="text-gray-500">{order.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <div>💸 Сумма: <b>{order.amount}₸</b></div>
                    <div>💎 Бонус: <b>+{order.bonusEarned}</b></div>
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
