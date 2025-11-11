import React, { useState, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCartIcon, CheckCircleIcon, PlusIcon, MinusIcon, ArrowPathIcon, TagIcon } from '@heroicons/react/24/solid';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { useCart, CartItem } from "../contexts/CartContext";
import { usePromo } from "../contexts/PromoContext";

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
    const { items, dispatch } = useCart();
    const { appliedPromos, totalDiscount, freeProducts, bonusPoints: promoBonusPoints, calculatePromosForCart } = usePromo();
    const [bonusPoints, setBonusPoints] = useState(0);
    const [bonusToUse, setBonusToUse] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const history = useHistory();
    
    // Вычисляем акции при изменении корзины
    useEffect(() => {
        const cartForPromo = items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            categoryId: item.categoryId
        }));
        calculatePromosForCart(cartForPromo);
    }, [items, calculatePromosForCart]);
    
    const amount = items.reduce((sum, x) => sum + x.price * x.quantity, 0);
    const amountAfterPromo = Math.max(0, amount - totalDiscount);
    const bonusEarned = Math.floor(amountAfterPromo * 0.05) + promoBonusPoints;
    
    const getUserId = () => { return 'user_id_placeholder'; };
    
    useEffect(() => { 
        // Load user bonus points
        const userId = getUserId();
        const storedBonus = localStorage.getItem(`bonus_${userId}`);
        if (storedBonus) {
            setBonusPoints(Number(storedBonus));
        }
    }, []);
    
    const handleOrder = async () => {
        if (loading) return;
        setLoading(true);
        
        try {
            const userId = getUserId();
            const finalAmount = amountAfterPromo - bonusToUse;
            
            const response = await fetch(`${API}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    items,
                    amount: finalAmount,
                    bonusUsed: bonusToUse,
                    appliedPromos: appliedPromos.map(p => ({
                        promoId: p.promoId,
                        promoTitle: p.promoTitle,
                        discountAmount: p.discountAmount
                    }))
                })
            });
            
            if (response.ok) {
                const newBonusBalance = bonusPoints - bonusToUse + bonusEarned;
                localStorage.setItem(`bonus_${userId}`, String(newBonusBalance));
                setBonusPoints(newBonusBalance);
                dispatch({ type: 'CLEAR_CART' });
                setToastMessage(`Заказ оформлен! +${bonusEarned} бонусов`);
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                    history.push('/home');
                }, 2000);
            } else {
                throw new Error('Order failed');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            setToastMessage('Ошибка при оформлении заказа');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
        } finally {
            setLoading(false);
        }
    };
    
    const handleUpdateQuantity = useCallback((id: number, delta: number) => {
        const type = delta > 0 ? 'INCREASE_QUANTITY' : 'DECREASE_QUANTITY';
        dispatch({ type, payload: id });
    }, [dispatch]);
    
    return (
        <div className="bg-zinc-900 min-h-screen font-sans text-white">
            <header className="p-5 bg-zinc-900/70 backdrop-blur-lg sticky top-0 z-10 border-b border-zinc-800">
                <h1 className="text-2xl font-extrabold text-white text-center">Ваш заказ</h1>
            </header>
            <main className="p-5 space-y-6 pb-28">
                <AnimatePresence>
                    {items.length === 0 ? (
                        <EmptyCartState onGoToMenu={() => history.push("/menu")} />
                    ) : (
                        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="space-y-6">
                            {/* Список товаров */}
                            <motion.ul layout className="space-y-3">
                                {items.map((it: CartItem) => (
                                    <CartItemCard key={it.id} item={it} onUpdateQuantity={handleUpdateQuantity} />
                                ))}
                            </motion.ul>
                            
                            {/* Применённые акции */}
                            {appliedPromos.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl p-4 border border-yellow-500/30"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <TagIcon className="w-5 h-5 text-yellow-500" />
                                        <h3 className="font-bold text-yellow-500">Активные акции</h3>
                                    </div>
                                    {appliedPromos.map((promo, idx) => (
                                        <div key={idx} className="mb-2 last:mb-0">
                                            <p className="text-sm font-semibold text-white">{promo.promoTitle}</p>
                                            <p className="text-xs text-zinc-300">{promo.description}</p>
                                            {promo.discountAmount > 0 && (
                                                <p className="text-sm text-green-400 font-medium">
                                                    Скидка: -{promo.discountAmount} ₸
                                                </p>
                                            )}
                                            {promo.bonusPoints && promo.bonusPoints > 0 && (
                                                <p className="text-sm text-purple-400 font-medium">
                                                    Бонусы: +{promo.bonusPoints}
                                                </p>
                                            )}
                                            {promo.freeProducts && promo.freeProducts.length > 0 && (
                                                <p className="text-sm text-blue-400 font-medium">
                                                    Бесплатные товары: {promo.freeProducts.length} шт.
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                            
                            {/* Бесплатные товары */}
                            {freeProducts.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-blue-500/10 rounded-2xl p-4 border border-blue-500/30"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <SparklesIcon className="w-5 h-5 text-blue-400" />
                                        <h3 className="font-bold text-blue-400">Бесплатные товары</h3>
                                    </div>
                                    {freeProducts.map((fp, idx) => (
                                        <p key={idx} className="text-sm text-zinc-300">
                                            • Товар ID {fp.productId} × {fp.quantity}
                                        </p>
                                    ))}
                                </motion.div>
                            )}
                            
                            {/* Итоговый расчет */}
                            <div className="bg-zinc-800/50 rounded-2xl shadow-lg border border-zinc-700/50 p-6 space-y-4">
                                <div className="flex justify-between items-center text-zinc-400">
                                    <span>Сумма</span>
                                    <span className="font-medium text-white">{amount} ₸</span>
                                </div>
                                
                                {totalDiscount > 0 && (
                                    <div className="flex justify-between items-center text-zinc-400">
                                        <span>Скидка по акциям</span>
                                        <span className="font-medium text-green-400">-{totalDiscount} ₸</span>
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-center text-zinc-400">
                                    <span>Бонусы к начислению</span>
                                    <span className="font-medium text-emerald-400 flex items-center gap-1">
                                        <SparklesIcon className="w-4 h-4" /> +{bonusEarned}
                                    </span>
                                </div>
                                
                                <div className="border-t border-zinc-700 my-2" />
                                
                                <div className="flex justify-between items-center text-zinc-400">
                                    <span>Списать бонусы (доступно: {bonusPoints})</span>
                                    <span className="font-medium text-orange-400">-{bonusToUse} ₸</span>
                                </div>
                                <input 
                                    type="range" 
                                    min={0} 
                                    max={Math.min(bonusPoints, amountAfterPromo)} 
                                    value={bonusToUse} 
                                    disabled={loading}
                                    onChange={(e) => setBonusToUse(Number(e.target.value))}
                                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-orange-500" 
                                />
                                
                                <div className="border-t border-zinc-700 my-2" />
                                
                                <div className="flex justify-between items-center font-bold text-xl text-white">
                                    <span>Итого к оплате</span>
                                    <span>{amountAfterPromo - bonusToUse} ₸</span>
                                </div>
                            </div>
                            
                            <motion.button 
                                onClick={handleOrder} 
                                disabled={loading} 
                                whileTap={{ scale: 0.95 }}
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-3 disabled:opacity-70"
                            >
                                {loading ? (
                                    <ArrowPathIcon className="w-6 h-6 animate-spin" />
                                ) : (
                                    "Оплатить"
                                )}
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
            
            {/* Toast уведомление */}
            <AnimatePresence>
                {showToast && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.9 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white font-semibold px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3"
                    >
                        <CheckCircleIcon className="w-6 h-6 text-emerald-400" />
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Order;