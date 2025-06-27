// src/pages/Order.tsx
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
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
  IonButton,
} from "@ionic/react";
import { useCart, CartItem } from "../contexts/CartContext"; // поправь путь под себя
import { FiCheckCircle } from "react-icons/fi";

const API = import.meta.env.VITE_BACKEND_URL;

const Order: React.FC = () => {
  const { items, dispatch } = useCart();
  const [bonusPoints, setBonusPoints] = useState(0);
  const [bonusToUse, setBonusToUse] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  // Сумма заказа и бонусы
  const amount = items.reduce((sum, x) => sum + x.price * x.quantity, 0);
  const bonusEarned = Math.floor(amount * 0.05);

  // userId из localStorage
  const getUserId = () => {
    const userJson = localStorage.getItem("user");
    if (!userJson) return null;
    const u = JSON.parse(userJson);
    return u.uid || u.phone;
  };

  // Баланс бонусов при монтировании
  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;
    fetch(`${API}/placeOrder?userId=${encodeURIComponent(userId)}`, {
      method: "GET",
      mode: "cors",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(({ bonus }) => {
        setBonusPoints(bonus);
        setBonusToUse(Math.min(bonus, amount));
      })
      .catch(() => {
        setBonusPoints(0);
      });
  }, [amount]);

  const handleOrder = async () => {
    const userId = getUserId();
    if (!userId) {
      history.push("/login");
      return;
    }
    if (items.length === 0) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1700);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/placeOrder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          items,
          amount,
          bonusToUse,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Status ${res.status}`);
      setBonusPoints(data.newBonus);
      setShowToast(true);
      dispatch({ type: "CLEAR_CART" });
      setTimeout(() => {
        setShowToast(false);
        history.push("/"); // автопереход на главную через 2.2 сек после заказа
      }, 2200);
    } catch (err: any) {
      alert(
        err.message ||
          "Не удалось оформить заказ. Проверьте соединение и попробуйте ещё раз."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="bg-gray-900">
          <IonTitle className="text-white">Оформление заказа</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="bg-gradient-to-br from-gray-50 via-orange-50 to-white dark:from-black dark:to-gray-900 ion-padding min-h-screen">
        <div className="container mx-auto max-w-lg space-y-7 py-4">

          <h2 className="text-3xl font-extrabold text-center tracking-tight text-gray-900 dark:text-white">
            Ваша корзина
          </h2>

          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 pt-12 pb-8">
              <span className="text-5xl text-orange-400">🛒</span>
              <p className="text-xl text-gray-500">Корзина пуста</p>
              <IonButton
                className="mt-4"
                color="warning"
                onClick={() => history.push("/")}
              >
                В меню
              </IonButton>
            </div>
          ) : (
            <IonList className="space-y-3">
              {items.map((it: CartItem) => (
                <IonCard
                  key={it.id}
                  className="rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800"
                >
                  <IonCardHeader className="bg-white dark:bg-gray-900 rounded-t-2xl flex items-center gap-3">
                    {it.image && (
                      <img
                        src={it.image}
                        alt={it.name}
                        className="w-14 h-14 rounded-xl object-contain"
                      />
                    )}
                    <IonCardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                      {it.name}
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent className="bg-white dark:bg-gray-900 rounded-b-2xl flex justify-between items-center py-2 px-2">
                    <span className="text-gray-700 dark:text-gray-300">
                      ×{it.quantity}
                    </span>
                    <span className="text-lg font-extrabold text-orange-500">
                      {it.price * it.quantity}₸
                    </span>
                  </IonCardContent>
                </IonCard>
              ))}
            </IonList>
          )}

          {/* Итоги и бонусы */}
          {items.length > 0 && (
            <div className="p-5 bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-lg space-y-5">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-base text-gray-700 dark:text-gray-200">
                    К оплате:
                  </div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white">
                    {amount}₸
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base text-yellow-600">
                    Начислено бонусов:
                  </div>
                  <div className="text-xl font-semibold text-yellow-800">
                    +{bonusEarned}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 items-center flex-wrap">
                <div>
                  Ваши бонусы:
                  <span className="font-bold text-yellow-600 ml-2">
                    {bonusPoints}
                  </span>
                </div>
                <input
                  type="number"
                  min={0}
                  max={Math.min(bonusPoints, amount)}
                  value={bonusToUse}
                  disabled={loading}
                  onChange={(e) =>
                    setBonusToUse(
                      Math.min(Math.max(0, +e.target.value), bonusPoints, amount)
                    )
                  }
                  className="w-24 p-2 border rounded-lg bg-gray-50"
                />
                <div>₸ потратить</div>
              </div>
            </div>
          )}

          {items.length > 0 && (
            <IonButton
              expand="block"
              onClick={handleOrder}
              disabled={loading}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-lg py-4 rounded-2xl shadow-lg hover:scale-105 transition-all"
            >
              {loading ? "Оплата..." : "Оплатить (Apple Pay / Kaspi Pay)"}
            </IonButton>
          )}

          {/* ТОСТ */}
          <div className="fixed left-1/2 bottom-10 z-[140] -translate-x-1/2">
            <div
              className={`transition-all duration-300 ${
                showToast ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
              } bg-gradient-to-r from-orange-500 to-amber-400 text-white font-bold px-7 py-4 rounded-2xl shadow-xl flex items-center gap-3`}
            >
              <FiCheckCircle size={24} />
              {items.length === 0
                ? "Корзина пуста"
                : "Заказ оформлен! Спасибо 🙌"}
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Order;
