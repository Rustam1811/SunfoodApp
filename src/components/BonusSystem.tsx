// src/components/BonusSystem.tsx
import React, { useState, useEffect } from 'react';
import {
  IonCard, IonCardHeader, IonCardContent, IonLabel,
  IonRange, IonButton, IonToast, IonProgressBar, useIonToast
} from '@ionic/react';

const API = import.meta.env.VITE_BACKEND_URL;

interface Order { id: string; date: string; amount: number; bonusEarned: number; }

const BonusSystem: React.FC = () => {
  const [bonusPoints, setBonusPoints] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [bonusToUse, setBonusToUse] = useState(0);
  const [presentToast] = useIonToast();

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const userId = user?.uid || user?.phone;

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    (async () => {
      try {
        // 1) баланс
        const r1 = await fetch(`${API}/placeOrder?userId=${encodeURIComponent(userId)}`, { method: 'GET', mode: 'cors' });
        if (!r1.ok) throw new Error();
        const { bonus } = await r1.json();
        setBonusPoints(bonus);
        setBonusToUse(Math.min(bonus, bonusToUse));

        // 2) история (5 последних)
        const r2 = await fetch(`${API}/orders?userId=${encodeURIComponent(userId)}`, { method: 'GET', mode: 'cors' });
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
      presentToast({ message: `🎉 Списано ${bonusToUse} бонусов`, duration: 2000 });
    } catch {
      presentToast({ message: 'Ошибка списания', duration: 2000, color: 'danger' });
    }
  };

  if (!userId) {
    return <IonCard><IonCardContent>Войдите, чтобы увидеть бонусы.</IonCardContent></IonCard>;
  }
  if (loading) {
    return <IonProgressBar type="indeterminate" />;
  }

  return (
    <IonCard>
      <IonCardHeader>
        <IonLabel>Ваши бонусы: <b>{bonusPoints}</b></IonLabel>
      </IonCardHeader>
      <IonCardContent>
        <IonLabel>Тратить бонусов:</IonLabel>
        <IonRange
          min={1}
          max={bonusPoints}
          step={1}
          value={bonusToUse}
          onIonChange={e => setBonusToUse(e.detail.value as number)}
        />
        <div className="flex gap-2 mt-2">
          <IonButton size="small" onClick={() => setBonusToUse(bonusPoints)}>Max</IonButton>
          <IonButton expand="block" onClick={handleSpend} disabled={bonusToUse < 1}>
            Потратить {bonusToUse}
          </IonButton>
        </div>

        <IonLabel className="mt-4">Последние заказы:</IonLabel>
        {orders.length === 0
          ? <p>Нет заказов</p>
          : orders.map(o => (
            <div key={o.id} className="mt-2">
              <div>#{o.id.slice(0,6)} — {new Date(o.date).toLocaleDateString()}</div>
              <div>💸 {o.amount}₸  💎 +{o.bonusEarned}</div>
            </div>
          ))
        }
      </IonCardContent>
      <IonToast />
    </IonCard>
  );
};

export default BonusSystem;
