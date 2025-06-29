import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiShoppingCart, FiCheckCircle, FiPlus, FiMinus, FiLoader } from "react-icons/fi";
import { useCart, CartItem } from "../contexts/CartContext"; // Убедитесь, что путь верный

const API = import.meta.env.VITE_BACKEND_URL;

// ===================================================================
//  СТИЛИЗОВАННЫЕ КОМПОНЕНТЫ ДЛЯ СТРАНИЦЫ
// ===================================================================

const CartItemCard = ({ item, onUpdateQuantity }: { item: CartItem, onUpdateQuantity: (id: number, delta: number) => void }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-md"
    >
        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-contain flex-shrink-0" />
        <div className="flex-grow">
            <p className="font-bold text-slate-800">{item.name}</p>
            <p className="text-sm text-slate-500">{item.price} ₸ / шт.</p>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-7 h-7 bg-slate-200 rounded-md text-slate-600 hover:bg-slate-300 disabled:opacity-50" disabled={item.quantity <= 1}><FiMinus/></button>
            <span className="w-8 text-center font-bold text-lg">{item.quantity}</span>
            <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-7 h-7 bg-slate-200 rounded-md text-slate-600 hover:bg-slate-300"><FiPlus/></button>
        </div>
        <p className="font-bold text-lg w-20 text-right">{item.price * item.quantity} ₸</p>
    </motion.div>
);

const EmptyCartState = ({ onGoToMenu }: { onGoToMenu: () => void }) => (
    <div className="flex flex-col items-center gap-4 text-center py-16">
        <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center">
            <FiShoppingCart size={48} className="text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-700">Ваша корзина пуста</h3>
        <p className="text-slate-500 max-w-xs">Самое время добавить в нее что-нибудь вкусное из нашего меню.</p>
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onGoToMenu}
            className="mt-4 bg-white font-semibold py-3 px-6 rounded-xl shadow-lg border border-slate-200 hover:bg-slate-200 transition-colors"
        >
            Перейти в меню
        </motion.button>
    </div>
);

// ===================================================================
//  ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ ЗАКАЗА
// ===================================================================

const Order: React.FC = () => {
    // Вся ваша логика остается без изменений
    const { items, dispatch } = useCart();
    const [bonusPoints, setBonusPoints] = useState(0);
    const [bonusToUse, setBonusToUse] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    const amount = items.reduce((sum, x) => sum + x.price * x.quantity, 0);
    const bonusEarned = Math.floor(amount * 0.05);

    const getUserId = () => { /* ... ваша функция ... */ };

    useEffect(() => { /* ... ваш useEffect ... */ }, [amount]);
    
    const handleOrder = async () => {
        // ... ваша функция handleOrder ...
    };

    const handleUpdateQuantity = (id: number, delta: number) => {
        if (delta > 0) {
            dispatch({ type: 'INCREASE_QUANTITY', payload: id });
        } else {
            dispatch({ type: 'DECREASE_QUANTITY', payload: id });
        }
    };
    
    return (
        // ✨ Убираем Ionic, используем div и нашу светлую тему
        <div className="bg-slate-100 min-h-screen font-sans">
            <header className="p-5 bg-slate-100/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200">
                <h1 className="text-2xl font-extrabold text-slate-900 text-center">Ваш заказ</h1>
            </header>

            <main className="p-5 space-y-6">
                {items.length === 0 ? (
                    <EmptyCartState onGoToMenu={() => history.push("/menu")} />
                ) : (
                    <>
                        {/* Список товаров */}
                        <motion.ul layout className="space-y-3">
                            {items.map((it: CartItem) => (
                                <CartItemCard key={it.id} item={it} onUpdateQuantity={handleUpdateQuantity} />
                            ))}
                        </motion.ul>

                        {/* Блок итогов и бонусов */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
                            <div className="flex justify-between items-center text-slate-600">
                                <span>Сумма</span>
                                <span className="font-medium text-slate-800">{amount} ₸</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600">
                                <span>Бонусы к начислению</span>
                                <span className="font-medium text-emerald-500">+{bonusEarned}</span>
                            </div>
                            <div className="border-t border-slate-200 my-2" />
                            <div className="flex justify-between items-center text-slate-600">
                                <span>Списать бонусы</span>
                                <span className="font-medium text-orange-500">-{bonusToUse} ₸</span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={Math.min(bonusPoints, amount)}
                                value={bonusToUse}
                                disabled={loading}
                                onChange={(e) => setBonusToUse(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                            <div className="border-t border-slate-200 my-2" />
                            <div className="flex justify-between items-center font-bold text-xl">
                                <span>Итого к оплате</span>
                                <span>{amount - bonusToUse} ₸</span>
                            </div>
                        </div>

                        {/* Кнопка Оплаты */}
                        <motion.button
                            onClick={handleOrder}
                            disabled={loading}
                            whileTap={{ scale: 0.95 }}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-3 disabled:opacity-70"
                        >
                            {loading ? (
                                <FiLoader className="animate-spin" />
                            ) : (
                                "Оплатить"
                            )}
                        </motion.button>
                    </>
                )}
            </main>

            {/* Уведомление (Toast) */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white font-semibold px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3"
                    >
                        <FiCheckCircle className="text-emerald-400" />
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Order;