import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    StarIcon, 
    GiftIcon, 
    CurrencyDollarIcon,
    ShoppingBagIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface BonusData {
    balance: number;
    level: string;
    nextLevel: string;
    ordersToNextLevel: number;
    totalOrders: number;
    multiplier: number;
    earnedThisMonth: number;
    spentThisMonth: number;
    history: Array<{
        id: string;
        type: 'earned' | 'spent';
        amount: number;
        description: string;
        date: string;
    }>;
}

interface Reward {
    id: string;
    name: string;
    description: string;
    cost: number;
    discount: number;
    type: 'fixed' | 'percentage';
    category?: string;
    isActive: boolean;
}

const BonusSystemNew: React.FC = () => {
    const [bonusData, setBonusData] = useState<BonusData>({
        balance: 350,
        level: 'Любитель',
        nextLevel: 'Эксперт',
        ordersToNextLevel: 15,
        totalOrders: 35,
        multiplier: 1.2,
        earnedThisMonth: 120,
        spentThisMonth: 50,
        history: [
            { id: '1', type: 'earned', amount: 25, description: 'Заказ #1024', date: '2025-07-20' },
            { id: '2', type: 'spent', amount: 100, description: 'Скидка 200₸', date: '2025-07-19' },
            { id: '3', type: 'earned', amount: 30, description: 'Заказ #1023', date: '2025-07-18' }
        ]
    });

    const [rewards, setRewards] = useState<Reward[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'rewards' | 'history'>('overview');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ msg: string; color: 'green' | 'red' } | null>(null);

    useEffect(() => {
        fetchBonusData();
        fetchRewards();
    }, []);

    const fetchBonusData = async () => {
        try {
            const userId = getUserId();
            const response = await fetch(`https://us-central1-coffeeaddict-c9d70.cloudfunctions.net/userBonus?userId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                setBonusData(data);
            }
        } catch (error) {
            console.error('Ошибка загрузки бонусных данных:', error);
        }
    };

    const fetchRewards = async () => {
        try {
            const response = await fetch('https://us-central1-coffeeaddict-c9d70.cloudfunctions.net/bonusSettings');
            if (response.ok) {
                const data = await response.json();
                setRewards(data.rewards?.filter((r: Reward) => r.isActive) || []);
            }
        } catch (error) {
            console.error('Ошибка загрузки наград:', error);
        }
    };

    const getUserId = () => {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                return user.phone || user.id || '87053096206';
            }
        } catch (e) {
            console.error('Ошибка парсинга user из localStorage:', e);
        }
        return '87053096206'; // fallback для реального пользователя
    };

    const useReward = async (rewardId: string) => {
        setLoading(true);
        try {
            const userId = getUserId();
            const response = await fetch('https://us-central1-coffeeaddict-c9d70.cloudfunctions.net/useBonus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, rewardId })
            });

            if (response.ok) {
                const result = await response.json();
                setToast({ msg: `Награда активирована! Промокод: ${result.promoCode}`, color: 'green' });
                await fetchBonusData(); // Обновляем баланс
            } else {
                const error = await response.json();
                setToast({ msg: `Ошибка: ${error.message}`, color: 'red' });
            }
        } catch (error) {
            console.error('Ошибка использования награды:', error);
            setToast({ msg: 'Ошибка при использовании награды', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const getLevelProgress = () => {
        const levelOrder = ['Новичок', 'Любитель', 'Эксперт', 'VIP'];
        const currentIndex = levelOrder.indexOf(bonusData.level);
        const nextIndex = levelOrder.indexOf(bonusData.nextLevel);
        
        if (nextIndex === -1) return 100; // Максимальный уровень
        
        const baseOrders = [0, 10, 50, 100]; // Минимальные заказы для каждого уровня
        const currentMin = baseOrders[currentIndex] || 0;
        const nextMin = baseOrders[nextIndex] || 100;
        
        return ((bonusData.totalOrders - currentMin) / (nextMin - currentMin)) * 100;
    };

    return (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 min-h-screen p-4">
            <div className="max-w-4xl mx-auto">
                {/* Toast уведомления */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
                                toast.color === 'green' ? 'bg-green-500' : 'bg-red-500'
                            } text-white`}
                        >
                            {toast.msg}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Заголовок */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Бонусная система</h1>
                    <p className="text-gray-600">Зарабатывайте и тратьте бонусы с каждым заказом</p>
                </div>

                {/* Баланс и уровень */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="bg-yellow-100 rounded-full p-4 w-20 h-20 mx-auto mb-3 flex items-center justify-center">
                                <StarIcon className="w-10 h-10 text-yellow-600" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{bonusData.balance}</p>
                            <p className="text-gray-600">Доступно бонусов</p>
                        </div>
                        
                        <div className="text-center">
                            <div className="bg-purple-100 rounded-full p-4 w-20 h-20 mx-auto mb-3 flex items-center justify-center">
                                <GiftIcon className="w-10 h-10 text-purple-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{bonusData.level}</p>
                            <p className="text-gray-600">Текущий уровень</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div 
                                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${getLevelProgress()}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {bonusData.ordersToNextLevel} заказов до "{bonusData.nextLevel}"
                            </p>
                        </div>
                        
                        <div className="text-center">
                            <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-3 flex items-center justify-center">
                                <CurrencyDollarIcon className="w-10 h-10 text-green-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">x{bonusData.multiplier}</p>
                            <p className="text-gray-600">Множитель бонусов</p>
                        </div>
                    </div>
                </div>

                {/* Вкладки */}
                <div className="flex bg-white rounded-lg p-1 mb-6 shadow-sm">
                    {[
                        { id: 'overview', name: 'Обзор', icon: StarIcon },
                        { id: 'rewards', name: 'Награды', icon: GiftIcon },
                        { id: 'history', name: 'История', icon: ClockIcon }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
                                activeTab === tab.id 
                                    ? 'bg-amber-500 text-white shadow-md' 
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.name}
                        </button>
                    ))}
                </div>

                {/* Контент вкладок */}
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-xl p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        Заработано в этом месяце
                                    </h3>
                                    <p className="text-3xl font-bold text-green-600">+{bonusData.earnedThisMonth}</p>
                                    <p className="text-gray-600 text-sm mt-1">бонусов</p>
                                </div>
                                
                                <div className="bg-white rounded-xl p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        Потрачено в этом месяце
                                    </h3>
                                    <p className="text-3xl font-bold text-red-600">-{bonusData.spentThisMonth}</p>
                                    <p className="text-gray-600 text-sm mt-1">бонусов</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4">Как заработать больше бонусов?</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                            <ClockIcon className="w-5 h-5 text-yellow-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Утренние заказы</p>
                                            <p className="text-sm text-gray-600">+50% бонусов до 12:00</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <StarIcon className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Выходные</p>
                                            <p className="text-sm text-gray-600">Двойные бонусы в субботу и воскресенье</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'rewards' && (
                        <motion.div
                            key="rewards"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {rewards.map(reward => (
                                    <motion.div
                                        key={reward.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-semibold text-lg">{reward.name}</h3>
                                                <p className="text-gray-600 text-sm">{reward.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-amber-600">{reward.cost}</p>
                                                <p className="text-xs text-gray-500">бонусов</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-between items-center">
                                            <div className="text-sm">
                                                <span className="font-medium">Скидка: </span>
                                                <span className="text-green-600">
                                                    {reward.type === 'fixed' ? `${reward.discount}₸` : `${reward.discount}%`}
                                                </span>
                                            </div>
                                            
                                            <button
                                                onClick={() => useReward(reward.id)}
                                                disabled={bonusData.balance < reward.cost || loading}
                                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                    bonusData.balance >= reward.cost 
                                                        ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                                                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                }`}
                                            >
                                                {loading ? 'Загрузка...' : 'Использовать'}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'history' && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-xl shadow-sm"
                        >
                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-4">История операций</h3>
                                <div className="space-y-3">
                                    {bonusData.history.map(item => (
                                        <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                    item.type === 'earned' ? 'bg-green-100' : 'bg-red-100'
                                                }`}>
                                                    {item.type === 'earned' ? (
                                                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                                    ) : (
                                                        <ShoppingBagIcon className="w-5 h-5 text-red-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{item.description}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(item.date).toLocaleDateString('ru-RU')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`text-lg font-semibold ${
                                                item.type === 'earned' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {item.type === 'earned' ? '+' : '-'}{item.amount}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default BonusSystemNew;
