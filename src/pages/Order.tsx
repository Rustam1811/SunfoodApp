import React, { useState, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCartIcon, CheckCircleIcon, PlusIcon, MinusIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { useCart, CartItem } from "../contexts/CartContext";
import QRCode from "../components/QRCode";
import OrderStatusBadge from "../components/OrderStatusBadge";

const API = import.meta.env.VITE_BACKEND_URL;

const CartItemCard = ({ item, onUpdateQuantity }: { item: CartItem; onUpdateQuantity: (id: number, delta: number) => void; }) => (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
        className="bg-zinc-800/50 rounded-2xl p-4 flex items-center gap-4 border border-zinc-700/50">
        {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-contain bg-zinc-700/50 p-1 flex-shrink-0" />}
        <div className="flex-grow">
            <p className="font-bold text-white">{item.name}</p>
            <p className="text-sm text-zinc-400">{item.price} ₸ / шт.</p>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-8 h-8 bg-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-600 disabled:opacity-50 transition-colors"><MinusIcon className="w-5 h-5 mx-auto"/></button>
            <span className="w-8 text-center font-bold text-lg text-white">{item.quantity}</span>
            <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-8 h-8 bg-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-600 transition-colors"><PlusIcon className="w-5 h-5 mx-auto"/></button>
        </div>
    </motion.div>
);

const EmptyCartState = ({ onGoToMenu }: { onGoToMenu: () => void; }) => (
    <div className="flex flex-col items-center gap-4 text-center py-16">
        <div className="w-24 h-24 bg-zinc-800/80 rounded-full flex items-center justify-center border border-zinc-700">
            <ShoppingCartIcon className="w-12 h-12 text-zinc-500" />
        </div>
        <h3 className="text-xl font-bold text-white">Ваша корзина пуста</h3>
        <p className="text-zinc-400 max-w-xs">Самое время добавить в нее что-нибудь вкусное из нашего меню.</p>
        <motion.button whileTap={{ scale: 0.95 }} onClick={onGoToMenu}
            className="mt-4 bg-zinc-800 font-semibold py-3 px-6 rounded-xl shadow-lg border border-zinc-700 hover:bg-zinc-700 transition-colors text-white">
            Перейти в меню
        </motion.button>
    </div>
);

const Order: React.FC = () => {
    // Вся логика без изменений
    const { items, dispatch } = useCart();
    const [bonusPoints, setBonusPoints] = useState(0);
    const [bonusToUse, setBonusToUse] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const history = useHistory();
    const amount = items.reduce((sum, x) => sum + x.price * x.quantity, 0);
    const bonusEarned = Math.floor(amount * 0.05);
    
    // Получаем userId из localStorage
    const getUserId = () => {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                return user.phone || user.id || '+77071234567';
            }
        } catch (e) {
            console.error('Ошибка парсинга user из localStorage:', e);
        }
        return '+77071234567'; // fallback
    };
    
    const userId = getUserId();

    // Загрузка заказов пользователя
    const fetchOrders = useCallback(async () => {
        try {
            const res = await fetch(`/api/orders?userId=${userId}`);
            if (!res.ok) return;
            const data = await res.json();
            // API возвращает массив для пользователей, объект с orders для админки
            const ordersArray = Array.isArray(data) ? data : data.orders || [];
            setOrders(ordersArray);
        } catch (error) {
            console.error('Ошибка загрузки заказов:', error);
        }
    }, [userId]);

    useEffect(() => {
        fetchOrders();
        // Автообновление каждые 10 секунд
        const interval = setInterval(fetchOrders, 5000); // Обновляем каждые 5 секунд для быстрого отображения статусов
        return () => clearInterval(interval);
    }, [fetchOrders]);

    // ...остальная логика бонусов и оформления заказа...
    const handleUpdateQuantity = useCallback((id: number, delta: number) => {
        const type = delta > 0 ? 'INCREASE_QUANTITY' : 'DECREASE_QUANTITY';
        dispatch({ type, payload: id });
    }, [dispatch]);

    const handleOrder = async () => {
        if (items.length === 0) return;
        
        setLoading(true);
        try {
            const orderData = {
                userId,
                items: items.map(item => ({
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    id: item.id
                })),
                amount: amount - bonusToUse,
                bonusUsed: bonusToUse
            };

            console.log('Отправляем заказ:', orderData); // Для отладки

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();
            console.log('Ответ API:', result); // Для отладки

            if (response.ok) {
                // Очищаем корзину после успешного заказа
                dispatch({ type: 'CLEAR_CART' });
                // Обновляем список заказов
                await fetchOrders();
                alert('Заказ успешно оформлен!');
            } else {
                console.error('Ошибка API:', result);
                alert('Ошибка при оформлении заказа: ' + (result.error || 'Неизвестная ошибка'));
            }
        } catch (error) {
            console.error('Ошибка заказа:', error);
            alert('Ошибка при оформлении заказа');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-zinc-900 min-h-screen font-sans text-white">
            <header className="p-5 bg-zinc-900/70 backdrop-blur-lg sticky top-0 z-10 border-b border-zinc-800">
                <h1 className="text-2xl font-extrabold text-white text-center">Ваш заказ</h1>
            </header>
            <main className="p-5 space-y-6 pb-28">
                {/* История заказов */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold mb-2">Мои заказы</h2>
                    {orders.length === 0 ? (
                        <div className="text-zinc-400">Нет заказов</div>
                    ) : (
                        <ul className="space-y-3">
                            {orders.map(order => (
                                <li key={order.id} className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-white">Заказ #{order.id.slice(-6)}</span>
                                        <OrderStatusBadge status={order.status as 'pending' | 'accepted' | 'ready' | 'completed'} />
                                    </div>
                                    <div className="text-sm text-zinc-300 mb-1">Сумма: <span className="font-bold text-white">{order.amount} ₸</span></div>
                                    <div className="text-xs text-zinc-400">{order.date ? new Date(order.date).toLocaleString() : 'Время неизвестно'}</div>
                                    {order.status === 'ready' && (
                                        <div className="mt-3 p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
                                            <div className="text-amber-400 text-sm font-bold mb-3 text-center">🔥 Заказ готов! Покажите QR-код на кассе:</div>
                                            <div className="flex justify-center">
                                                <QRCode value={`ORDER:${order.id}`} size={120} />
                                            </div>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Текущая корзина для оформления */}
                <section>
                    <h2 className="text-lg font-bold mb-2">Корзина</h2>
                    <AnimatePresence>
                        {items.length === 0 ? (
                            <EmptyCartState onGoToMenu={() => history.push("/menu")} />
                        ) : (
                            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="space-y-6">
                                <motion.ul layout className="space-y-3">
                                    {items.map((it: CartItem) => (
                                        <CartItemCard key={it.id} item={it} onUpdateQuantity={handleUpdateQuantity} />
                                    ))}
                                </motion.ul>
                                <div className="bg-zinc-800/50 rounded-2xl shadow-lg border border-zinc-700/50 p-6 space-y-4">
                                    <div className="flex justify-between items-center text-zinc-400">
                                        <span>Сумма</span>
                                        <span className="font-medium text-white">{amount} ₸</span>
                                    </div>
                                    <div className="flex justify-between items-center text-zinc-400">
                                        <span>Бонусы к начислению</span>
                                        <span className="font-medium text-emerald-400 flex items-center gap-1"><SparklesIcon className="w-4 h-4" /> +{bonusEarned}</span>
                                    </div>
                                    <div className="border-t border-zinc-700 my-2" />
                                    <div className="flex justify-between items-center text-zinc-400">
                                        <span>Списать бонусы</span>
                                        <span className="font-medium text-orange-400">-{bonusToUse} ₸</span>
                                    </div>
                                    <input type="range" min={0} max={Math.min(bonusPoints, amount)} value={bonusToUse} disabled={loading}
                                        onChange={(e) => setBonusToUse(Number(e.target.value))}
                                        className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                                    <div className="border-t border-zinc-700 my-2" />
                                    <div className="flex justify-between items-center font-bold text-xl text-white">
                                        <span>Итого к оплате</span>
                                        <span>{amount - bonusToUse} ₸</span>
                                    </div>
                                </div>
                                <motion.button onClick={handleOrder} disabled={loading} whileTap={{ scale: 0.95 }}
                                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-3 disabled:opacity-70">
                                    {loading ? (<ArrowPathIcon className="w-6 h-6 animate-spin" />) : ("Оплатить")}
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            </main>
            <AnimatePresence>
                {showToast && (
                    <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white font-semibold px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3">
                        <CheckCircleIcon className="w-6 h-6 text-emerald-400" />
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Order;