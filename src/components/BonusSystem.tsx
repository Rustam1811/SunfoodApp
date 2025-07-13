import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const API = import.meta.env.VITE_BACKEND_URL;

interface Order {
  id: string;
  date: string;
  amount: number;
  bonusEarned: number;
}

const BonusSystem: React.FC = () => {
  const [bonusPoints, setBonusPoints] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [bonusToUse, setBonusToUse] = useState(0);
  const [toast, setToast] = useState<{ msg: string; color: 'green' | 'red' } | null>(null);

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const userId = user?.uid || user?.phone;

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    (async () => {
      try {
        const r1 = await fetch(`${API}/placeOrder?userId=${encodeURIComponent(userId)}`);
        if (!r1.ok) throw new Error();
        const { bonus } = await r1.json();
        setBonusPoints(bonus);
        setBonusToUse(Math.min(bonus, bonusToUse));

        const r2 = await fetch(`${API}/orders?userId=${encodeURIComponent(userId)}`);
        const data: Order[] = r2.ok ? await r2.json() : [];
        setOrders(data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const handleSpend = async () => {
    if (!userId || bonusToUse < 1 || bonusToUse > bonusPoints) return;
    try {
      const res = await fetch(`${API}/placeOrder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, items: [], amount: 0, bonusToUse }),
      });
      const { newBonus } = await res.json();
      setBonusPoints(newBonus);
      setBonusToUse(Math.min(newBonus, bonusToUse));
      setToast({ msg: `🎉 Списано ${bonusToUse} бонусов`, color: 'green' });
    } catch {
      setToast({ msg: 'Ошибка списания', color: 'red' });
    }
  };

  if (!userId) {
    return (
      <div className="p-4 rounded-lg shadow bg-white">
        <p className="text-sm text-gray-500">Войдите, чтобы увидеть бонусы.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full bg-gray-100 h-2 rounded animate-pulse mt-4" />
    );
  }

  return (
    <div className="p-4 rounded-lg shadow bg-white space-y-4">
      <div className="flex justify-between items-center">
        <label className="font-semibold text-lg">Ваши бонусы:</label>
        <span className="text-xl font-bold text-green-600">{bonusPoints}</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Тратить бонусов:</label>
        <input
          type="range"
          min={1}
          max={bonusPoints}
          value={bonusToUse}
          onChange={(e) => setBonusToUse(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between items-center mt-2 gap-2">
          <button
            className="text-sm px-3 py-1 bg-gray-200 rounded"
            onClick={() => setBonusToUse(bonusPoints)}
          >
            Max
          </button>
          <button
            onClick={handleSpend}
            disabled={bonusToUse < 1}
            className={`flex-1 text-white px-4 py-2 rounded ${bonusToUse < 1 ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'}`}
          >
            Потратить {bonusToUse}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Последние заказы:</label>
        {orders.length === 0 ? (
          <p className="text-sm text-gray-500 mt-1">Нет заказов</p>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="mt-2 text-sm text-gray-700">
              <div>#{o.id.slice(0, 6)} — {new Date(o.date).toLocaleDateString()}</div>
              <div>💸 {o.amount}₸  💎 +{o.bonusEarned}</div>
            </div>
          ))
        )}
      </div>

      {toast && (
        <div
          className={`flex items-center gap-2 text-white px-4 py-2 rounded shadow mt-2 ${
            toast.color === 'green' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.color === 'green' ? (
            <CheckCircleIcon className="w-5 h-5" />
          ) : (
            <ExclamationCircleIcon className="w-5 h-5" />
          )}
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} className="ml-auto text-white">✕</button>
        </div>
      )}
    </div>
  );
};

export default BonusSystem;
