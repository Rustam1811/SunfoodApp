import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonModal,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/react';
import firebase from 'firebase/compat/app';
import { firestore } from '../firebase/firebase';
import BonusSystem from '../components/BonusSystem';
import { useHistory } from 'react-router-dom';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

const Order: React.FC = () => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const history = useHistory();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const snapshot = await firestore.collection('orders').get();
        const items: OrderItem[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as OrderItem);
        });
        setOrderItems(items);
      } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
      }
    };
    fetchOrders();
  }, []);

  const getTotal = () =>
    orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleOrder = async () => {
    if (!user) {
      history.push('/login');
      return;
    }
    try {
      await firestore.collection('placedOrders').add({
        items: orderItems,
        total: getTotal(),
        userId: user.phone, // ✅ Используем номер
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setOrderItems([]);
      setShowModal(true);
      setTimeout(() => setShowModal(false), 3000);
    } catch (error) {
      console.error('Ошибка оформления заказа:', error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="bg-gray-900">
          <IonTitle className="text-white">Ваш заказ</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="bg-gray-100 text-gray-800 ion-padding">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Корзина</h2>

          {orderItems.length === 0 ? (
            <p className="text-center text-lg text-gray-600">Корзина пуста</p>
          ) : (
            <IonList className="space-y-4">
              {orderItems.map((item) => (
                <IonCard key={item.id} className="rounded-xl shadow-lg">
                  <IonCardHeader className="bg-white rounded-t-xl">
                    <IonCardTitle className="text-xl font-semibold text-gray-900">
                      {item.name}
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent className="bg-white rounded-b-xl">
                    <p className="text-base">
                      Кол-во: <span className="font-medium">{item.quantity}</span>
                    </p>
                    <p className="text-base">
                      Цена: <span className="font-medium">{item.price}₸</span>
                    </p>
                  </IonCardContent>
                </IonCard>
              ))}
            </IonList>
          )}

          <div className="mt-8 bg-white p-8 rounded-xl shadow-2xl text-2xl flex justify-between items-center">
            <span>Итого:</span>
            <span className="font-bold">{getTotal()}₸</span>
          </div>

          <div className="mt-6">
            <div
              onClick={handleOrder}
              className="group relative cursor-pointer text-center bg-gradient-to-r from-gray-800 to-gray-900 text-white text-base font-semibold py-2 px-4 rounded-full shadow-md transition transform hover:scale-105 hover:shadow-lg overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.2),transparent)] opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <span className="relative flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14"></path>
                  <path d="M12 5l7 7-7 7"></path>
                </svg>
                Оплатить (Apple Pay / Kaspi Pay)
              </span>
            </div>
          </div>

          <BonusSystem />

          <IonModal isOpen={showModal} backdropDismiss={false}>
            <div className="flex items-center justify-center h-full bg-gray-900">
              <div className="bg-white text-gray-800 rounded-2xl p-10 shadow-2xl animate-bounce-slow text-center">
                <h2 className="text-3xl font-bold mb-4">✅ Заказ оформлен</h2>
                <p className="text-xl">Бонусы начислены на ваш счет</p>
              </div>
            </div>
          </IonModal>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Order;
