// src/pages/Order.tsx
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonModal,
  IonButton
} from '@ionic/react';
import { useCart, CartItem } from './CartContext';

const API = import.meta.env.VITE_BACKEND_URL; // https://coffee-addict.vercel.app/api

const Order: React.FC = () => {
  const { state: { items }, dispatch } = useCart();
  const [bonusPoints, setBonusPoints] = useState(0);
  const [bonusToUse, setBonusToUse] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const history = useHistory();

  // Считаем сумму корзины
  const amount = items.reduce((sum, x) => sum + x.price * x.quantity, 0);
  const bonusEarned = Math.floor(amount * 0.05);

  // Из localStorage вытягиваем userId
  const getUserId = () => {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    const u = JSON.parse(userJson);
    return u.uid || u.phone;
  };

  // При монтировании подгружаем баланс
  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;

    fetch(`${API}/placeOrder?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
      mode: 'cors'
    })
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(({ bonus }) => {
        setBonusPoints(bonus);
        setBonusToUse(Math.min(bonus, amount));
      })
      .catch(err => {
        console.error('Не удалось загрузить бонусы:', err);
      });
  }, [amount]);

  const handleOrder = async () => {
    const userId = getUserId();
    if (!userId) {
      history.push('/login');
      return;
    }
    if (items.length === 0) {
      alert('Ваша корзина пуста');
      return;
    }

    try {
      const res = await fetch(`${API}/placeOrder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          items,
          amount,
          bonusToUse
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Status ${res.status}`);

      // Обновляем локальный баланс
      setBonusPoints(data.newBonus);

      // Очищаем корзину, показываем модалку
      dispatch({ type: 'CLEAR_CART' });
      setShowModal(true);
      setTimeout(() => setShowModal(false), 3000);
    } catch (err: any) {
      console.error('Ошибка оформления заказа:', err);
      alert(err.message || 'Не удалось оформить заказ. Попробуйте ещё раз.');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="bg-gray-900">
          <IonTitle className="text-white">Оформление заказа</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="bg-gray-100 ion-padding">
        <div className="container mx-auto max-w-lg space-y-6">

          <h2 className="text-3xl font-bold text-center">Ваша корзина</h2>
          {items.length === 0 ? (
            <p className="text-center text-gray-600">Корзина пуста</p>
          ) : (
            <IonList className="space-y-4">
              {items.map((it: CartItem) => (
                <IonCard key={it.id} className="rounded-xl shadow">
                  <IonCardHeader className="bg-white rounded-t-xl">
                    <IonCardTitle className="text-lg font-semibold">
                      {it.name}
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent className="bg-white rounded-b-xl flex justify-between">
                    <span>×{it.quantity}</span>
                    <span>{it.price * it.quantity}₸</span>
                  </IonCardContent>
                </IonCard>
              ))}
            </IonList>
          )}

          {/* Итоги и бонусы */}
          <div className="p-4 bg-white rounded-xl shadow-lg space-y-4">
            <div className="flex justify-between">
              <div>
                <div className="text-xl">Всего к оплате:</div>
                <div className="text-2xl font-bold">{amount}₸</div>
              </div>
              <div className="text-right">
                <div className="text-lg text-yellow-600">Начислено бонусов:</div>
                <div className="text-xl font-semibold text-yellow-800">+{bonusEarned}</div>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <div>
                Ваши бонусы: <span className="font-bold text-yellow-600">{bonusPoints}</span>
              </div>
              <input
                type="number"
                min={0}
                max={Math.min(bonusPoints, amount)}
                value={bonusToUse}
                onChange={e => setBonusToUse(Math.min(Math.max(0, +e.target.value), bonusPoints, amount))}
                className="w-24 p-2 border rounded-lg"
              />
              <div>₸ тратить</div>
            </div>
          </div>

          <IonButton
            expand="block"
            onClick={handleOrder}
            className="bg-gradient-to-r from-gray-800 to-gray-900 text-white"
          >
            Оплатить (Apple Pay / Kaspi Pay)
          </IonButton>

          <IonModal isOpen={showModal} backdropDismiss={false}>
            <div className="flex items-center justify-center h-full bg-gray-900">
              <div className="bg-white p-8 rounded-2xl shadow-2xl text-center">
                <h2 className="text-3xl font-bold mb-2">✅ Заказ оформлен!</h2>
                <p className="text-lg">
                  Бонусы успешно учтены: теперь у вас {bonusPoints} баллов
                </p>
              </div>
            </div>
          </IonModal>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Order;
