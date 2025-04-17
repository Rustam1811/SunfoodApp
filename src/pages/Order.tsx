// src/pages/Order.tsx
import React, { useState } from 'react';
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
import BonusSystem from '../components/BonusSystem';

const API = import.meta.env.VITE_BACKEND_URL; // например "https://coffee-addict.vercel.app/api"

const Order: React.FC = () => {
  const { state: { items }, dispatch } = useCart();
  const [showModal, setShowModal] = useState(false);
  const history = useHistory();

  // Получаем текущий userId
  const getUserId = () => {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    const user = JSON.parse(userJson);
    return user.uid || user.phone;
  };

  // Считаем общую сумму и бонус
  const amount = items.reduce((sum, x) => sum + x.price * x.quantity, 0);
  const bonusEarned = Math.floor(amount * 0.05);

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
      const res = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, items, amount }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);

      // Очищаем корзину и показываем модалку
      dispatch({ type: 'CLEAR_CART' });
      setShowModal(true);
      setTimeout(() => setShowModal(false), 3000);
    } catch (err) {
      console.error('Ошибка оформления заказа:', err);
      alert('Не удалось оформить заказ. Попробуйте ещё раз.');
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
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">Ваша корзина</h2>

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

          {/* Сумма и бонус */}
          <div className="mt-6 p-4 bg-white rounded-xl shadow-lg flex justify-between items-center">
            <div>
              <div className="text-xl">Всего к оплате:</div>
              <div className="text-2xl font-bold">{amount}₸</div>
            </div>
            <div className="text-right">
              <div className="text-lg text-yellow-600">Начислено бонусов:</div>
              <div className="text-xl font-semibold text-yellow-800">+{bonusEarned}</div>
            </div>
          </div>

          {/* Кнопка оплаты */}
          <div className="mt-6">
            <IonButton
              expand="block"
              onClick={handleOrder}
              className="bg-gradient-to-r from-gray-800 to-gray-900 text-white"
            >
              Оплатить (Apple Pay / Kaspi Pay)
            </IonButton>
          </div>

          {/* История и достижения */}
          <div className="mt-10">
            <BonusSystem />
          </div>

          {/* Модалка об успешном заказе */}
          <IonModal isOpen={showModal} backdropDismiss={false}>
            <div className="flex items-center justify-center h-full bg-gray-900">
              <div className="bg-white p-8 rounded-2xl shadow-2xl text-center">
                <h2 className="text-3xl font-bold mb-2">✅ Заказ оформлен!</h2>
                <p className="text-lg">Бонусы начислены на ваш счёт</p>
              </div>
            </div>
          </IonModal>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Order;
