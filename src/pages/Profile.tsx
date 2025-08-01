import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { UserIcon, TrophyIcon, TicketIcon, FireIcon, StarIcon, ChevronRightIcon, ArrowLeftOnRectangleIcon, GiftIcon, CurrencyDollarIcon, ShoppingBagIcon, PencilIcon } from '@heroicons/react/24/solid';
import BonusSystemNew from '../components/BonusSystemNew';
import { AchievementList } from '../components/AchievementList';
import { PromotionBanner } from '../components/PromotionBanner';

// ===================================================================
//  УТИЛИТЫ
// ===================================================================

// Получаем данные пользователя из localStorage
const getUserData = () => {
    try {
        const userData = localStorage.getItem('user');
        if (userData) {
            return JSON.parse(userData);
        }
    } catch (e) {
        console.error('Ошибка получения данных пользователя:', e);
    }
    return { 
        id: '87053096206', 
        name: 'Пользователь', 
        phone: '87053096206',
        avatar: "https://images.unsplash.com/photo-1531123414780-f74242c2b052?auto=format&fit=crop&w=300&h=300&q=80"
    };
};

// Сохраняем данные пользователя в localStorage
const saveUserData = (userData: any) => {
    try {
        localStorage.setItem('user', JSON.stringify(userData));
    } catch (e) {
        console.error('Ошибка сохранения данных пользователя:', e);
    }
};

// ===================================================================
//  ДАННЫЕ И ТИПЫ
// ===================================================================

const initialUserProfile = {
    name: "Манарбек",
    avatar: "https://images.unsplash.com/photo-1531123414780-f74242c2b052?auto=format&fit=crop&w=300&h=300&q=80",
    stamps: 10,
    rarity: "common",
    stampsToReward: 10,
    currentReward: {
        name: "Бесплатный Капучино",
        image: "https://images.unsplash.com/photo-1557006034-834c6c0d49c2?auto=format&fit=crop&w=800&q=80"
    },
    nextReward: {
        name: "Скидка 50% на десерт",
        image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80"
    },
    achievements: [
        { id: 1, name: "Первый заказ", unlocked: true, icon: "☕", isNew: false, rarity: "common" },
        { id: 2, name: "Стрик в неделю", unlocked: true, icon: "🔥", isNew: true, rarity: "rare" },
        { id: 3, name: "Эксперт", unlocked: true, icon: "🧪", isNew: false, rarity: "epic" },
        { id: 4, name: "Утренний ритуал", unlocked: false, icon: "☀️", rarity: "common" },
        { id: 5, name: "VIP", unlocked: false, icon: "👑", rarity: "legendary" },
    ],
    totalAchievements: 5,
    personalQuests: [
        { id: 1, title: "Попробуйте наш новый Раф", description: "Сделайте заказ на авторский напиток и получите +50 баллов." },
        { id: 2, title: "Скидка на ваш любимый напиток", description: "На этой неделе ваш Латте со скидкой 20%." },
    ],
    bonusData: {
        balance: 0,
        level: 'Новичок',
        nextLevel: 'Любитель',
        ordersToNextLevel: 10,
        totalOrders: 0,
        multiplier: 1.0,
        earnedThisMonth: 0,
        spentThisMonth: 0
    },
    recentOrders: [],
    orderStats: {
        totalSpent: 0,
        favoriteItem: 'Капучино',
        averageOrderValue: 0
    }
};

// ===================================================================
//  КОМПОНЕНТЫ
// ===================================================================

const StatsBar = ({ bonusData, orderStats }) => (
    <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl shadow-lg flex items-center gap-3 border border-slate-200/60">
            <CurrencyDollarIcon className="w-8 h-8 text-green-400 flex-shrink-0"/>
            <div>
                <p className="text-2xl font-bold text-slate-900">{bonusData.balance}</p>
                <p className="text-xs text-slate-500">Бонусы</p>
            </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-lg flex items-center gap-3 border border-slate-200/60">
            <ShoppingBagIcon className="w-8 h-8 text-blue-400 flex-shrink-0"/>
            <div>
                <p className="text-2xl font-bold text-slate-900">{bonusData.totalOrders}</p>
                <p className="text-xs text-slate-500">Заказов</p>
            </div>
        </div>
         <div className="bg-white p-4 rounded-2xl shadow-lg flex items-center gap-3 border border-slate-200/60">
            <StarIcon className="w-8 h-8 text-purple-400 flex-shrink-0"/>
            <div>
                <p className="text-lg font-bold text-slate-900">x{bonusData.multiplier}</p>
                <p className="text-xs text-slate-500">Множитель</p>
            </div>
        </div>
    </div>
);

const NextRewardCard = ({ reward, stamps, stampsToReward, onClaim, isClaimable }) => {
    const progress = (stamps / stampsToReward) * 100;

    return (
        <div className="bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center text-center border border-slate-200/80 relative overflow-hidden min-h-[340px]">
            <AnimatePresence mode="wait">
                {isClaimable ? (
                    <motion.div key="claim" initial={{opacity: 0, scale: 0.8}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.8}} className="w-full flex flex-col h-full justify-between">
                        <div>
                            <p className="text-sm font-semibold text-emerald-600 tracking-wider">НАГРАДА ГОТОВА!</p>
                            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">{reward.name}</h2>
                        </div>
                        <img src={reward.image} className="w-36 h-36 my-4 object-cover rounded-full shadow-2xl" alt={reward.name} />
                        <motion.button 
                            onClick={onClaim}
                            whileTap={{ scale: 0.95 }}
                            className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-4 rounded-xl shadow-lg"
                        >
                            Получить награду
                        </motion.button>
                    </motion.div>
                ) : (
                    <motion.div key="progress" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="w-full">
                        <p className="text-sm font-semibold text-orange-600 tracking-wider">СЛЕДУЮЩАЯ НАГРАДА</p>
                        <h2 className="text-3xl font-extrabold text-slate-900 mt-2">{reward.name}</h2>
                        <div className="relative w-36 h-36 my-4">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" className="stroke-slate-200" strokeWidth="10" fill="transparent" />
                                <motion.circle cx="50" cy="50" r="45" className="stroke-orange-500" strokeWidth="10" fill="transparent" strokeLinecap="round" transform="rotate(-90 50 50)"
                                    initial={{ strokeDasharray: `0, 283` }} animate={{ strokeDasharray: `${progress * 2.83}, 283` }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }} />
                            </svg>
                            <img src={reward.image} className="absolute inset-0 w-full h-full object-cover rounded-full p-6" alt={reward.name} />
                        </div>
                        <p className="text-base text-slate-600">
                            Осталось <span className="font-bold text-slate-800">{stampsToReward - stamps}</span> заказа
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const AchievementIcon = ({ achievement }: { achievement: { unlocked: boolean, rarity: string, icon: string, name: string, isNew?: boolean } }) => {
    const rarityStyles: { [key: string]: string } = {
        common: "bg-slate-200 text-slate-600",
        rare: "bg-blue-100 text-blue-600",
        epic: "bg-purple-100 text-purple-600",
        legendary: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md shadow-amber-500/40"
    };
    return (
        <div className="flex flex-col items-center gap-2 text-center">
            <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300 transform group-hover:-translate-y-1 ${
                achievement.unlocked ? rarityStyles[achievement.rarity] : "bg-slate-200 text-slate-400"
            }`}>
                {achievement.unlocked ? achievement.icon : "❓"}
                {achievement.isNew && (
                    <span className="absolute -top-2 -right-2 block h-5 w-5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex h-5 w-5 rounded-full bg-red-500"></span>
                    </span>
                )}
            </div>
            <p className="text-xs text-slate-500 w-20 truncate">{achievement.name}</p>
        </div>
    );
};

const ConfettiExplosion = () => (
    <div className="fixed inset-0 z-[200] pointer-events-none">
        {[...Array(50)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-2 h-4 bg-yellow-400 rounded-full"
                initial={{ x: '50vw', y: '50vh', opacity: 1}}
                animate={{
                    x: `${Math.random() * 100}vw`,
                    y: `${Math.random() * 100}vh`,
                    scale: [1, 0.5, 1],
                    rotate: Math.random() * 360,
                    opacity: 0,
                }}
                transition={{ duration: 1.5, ease: "easeOut", delay: Math.random() * 0.5 }}
            />
        ))}
    </div>
);

// ===================================================================
//  ГЛАВНЫЙ КОМПОНЕНТ СТРАНИЦЫ
// ===================================================================

const UltimateProfilePage: React.FC = () => {
    const [profile, setProfile] = useState(initialUserProfile);
    const [isCelebrating, setIsCelebrating] = useState(false);
    const [showBonusSystem, setShowBonusSystem] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [tempUserName, setTempUserName] = useState('');

    useEffect(() => {
        fetchBonusData();
        fetchOrderStats();
        // Загружаем имя пользователя
        const userData = getUserData();
        setTempUserName(userData.name || 'Пользователь');
    }, []);

    const fetchBonusData = async () => {
        try {
            const userId = getUserId();
            console.log('🔥 Profile: загружаем бонусы для пользователя:', userId);
            
            const response = await fetch(`https://us-central1-coffeeaddict-c9d70.cloudfunctions.net/userBonus?userId=${userId}`);
            console.log('🔥 Profile: ответ API user-bonus:', response.status);
            
            if (response.ok) {
                const bonusData = await response.json();
                console.log('🔥 Profile: получены данные бонусов:', bonusData);
                setProfile(prev => ({ ...prev, bonusData }));
            } else {
                const errorData = await response.json();
                console.error('🔥 Profile: ошибка API user-bonus:', errorData);
            }
        } catch (error) {
            console.error('Ошибка загрузки бонусных данных:', error);
        }
    };

    const fetchOrderStats = async () => {
        try {
            const userId = getUserId();
            const response = await fetch(`https://us-central1-coffeeaddict-c9d70.cloudfunctions.net/orders?userId=${userId}`);
            if (response.ok) {
                const orders = await response.json();
                const totalSpent = orders.reduce((sum, order) => sum + order.amount, 0);
                const averageOrderValue = orders.length > 0 ? Math.round(totalSpent / orders.length) : 0;
                
                // Находим самый популярный товар
                const itemCounts = {};
                orders.forEach(order => {
                    order.items?.forEach(item => {
                        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
                    });
                });
                const favoriteItem = Object.keys(itemCounts).reduce((a, b) => 
                    itemCounts[a] > itemCounts[b] ? a : b, 'Капучино');

                setProfile(prev => ({
                    ...prev,
                    orderStats: { totalSpent, favoriteItem, averageOrderValue },
                    recentOrders: orders.slice(0, 3)
                }));
            }
        } catch (error) {
            console.error('Ошибка загрузки статистики заказов:', error);
        }
    };

    const getUserId = () => {
        try {
            const userData = localStorage.getItem('user');
            console.log('🔥 getUserId: userData из localStorage:', userData);
            if (userData) {
                const user = JSON.parse(userData);
                console.log('🔥 getUserId: распарсенный user:', user);
                const userId = user.phone || user.id || user.userId || '87053096206';
                console.log('🔥 getUserId: итоговый userId:', userId);
                return userId;
            }
        } catch (e) {
            console.error('Ошибка парсинга user из localStorage:', e);
        }
        // Временно используем правильный userId для тестирования бонусов
        return '87053096206';
    };

    // Функции для редактирования профиля
    const handleSaveProfile = () => {
        const userData = getUserData();
        const updatedUserData = {
            ...userData,
            name: tempUserName
        };
        saveUserData(updatedUserData);
        setProfile(prev => ({
            ...prev,
            name: tempUserName
        }));
        setIsEditingProfile(false);
    };

    const handleCancelEdit = () => {
        const userData = getUserData();
        setTempUserName(userData.name || 'Пользователь');
        setIsEditingProfile(false);
    };

    const handleClaimReward = useCallback(() => {
        setIsCelebrating(true);
        setTimeout(() => {
            setProfile(prev => ({
                ...prev,
                stamps: 0,
                currentReward: prev.nextReward,
                nextReward: { name: "Фирменная кружка", image: "https://..."}, // Появляется новая цель
            }));
            setIsCelebrating(false);
        }, 2000);
    }, []);

    const isRewardClaimable = profile.stamps >= profile.stampsToReward;
    
    const sectionVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1, y: 0,
            transition: { delay: i * 0.15 + 0.3, duration: 0.5, ease: "easeOut" }
        })
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
            {isCelebrating && <ConfettiExplosion />}
            
            {/* Модальное окно бонусной системы */}
            <AnimatePresence>
                {showBonusSystem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
                        onClick={() => setShowBonusSystem(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="w-full max-w-4xl max-h-[90vh] overflow-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <BonusSystemNew />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="p-4 flex items-center justify-between sticky top-0 bg-slate-50/80 backdrop-blur-lg z-20 border-b border-slate-900/10">
                <div className="w-10"></div>
                <h1 className="text-xl font-bold text-slate-900">Профиль</h1>
                <button className="p-2"><ArrowLeftOnRectangleIcon className="w-6 h-6 text-slate-500"/></button>
            </header>

            <main className="p-4 space-y-8 pb-28">
                <motion.section custom={0} initial="hidden" animate="visible" variants={sectionVariants}>
                    <div className="flex items-center gap-4">
                        <img src={profile.avatar} className="w-20 h-20 rounded-full object-cover shadow-lg" />
                        <div className="flex-1">
                            {isEditingProfile ? (
                                <div className="space-y-3">
                                    <input 
                                        type="text" 
                                        value={tempUserName}
                                        onChange={(e) => setTempUserName(e.target.value)}
                                        className="w-full text-2xl font-extrabold bg-white border-2 border-blue-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400"
                                        placeholder="Введите ваше имя"
                                        maxLength={30}
                                    />
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={handleSaveProfile}
                                            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                                        >
                                            ✓ Сохранить
                                        </button>
                                        <button 
                                            onClick={handleCancelEdit}
                                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                                        >
                                            ✕ Отмена
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-3xl font-extrabold text-slate-900">{getUserData().name}</h2>
                                        <p className="text-slate-500 text-sm mt-1">Нажмите на карандаш для редактирования</p>
                                    </div>
                                    <button 
                                        onClick={() => setIsEditingProfile(true)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl transition-colors shadow-lg"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center gap-2 mt-3">
                                <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                                    <GiftIcon className="w-5 h-5 text-purple-500" />
                                    {profile.bonusData.level}
                                </div>
                                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                                    <ShoppingBagIcon className="w-5 h-5 text-blue-500" />
                                    {profile.bonusData.totalOrders} заказов
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.section custom={1} initial="hidden" animate="visible" variants={sectionVariants}>
                    <StatsBar 
                        bonusData={profile.bonusData}
                        orderStats={profile.orderStats}
                    />
                </motion.section>

                {/* Новая секция бонусов */}
                <motion.section custom={2} initial="hidden" animate="visible" variants={sectionVariants}>
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-xl font-bold">Бонусная система</h3>
                                <p className="text-purple-100">Зарабатывайте и тратьте бонусы</p>
                            </div>
                            <GiftIcon className="w-10 h-10 text-white" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-3xl font-bold">{profile.bonusData.balance}</p>
                                <p className="text-purple-100 text-sm">Доступно бонусов</p>
                            </div>
                            <div>
                                <p className="text-xl font-bold">x{profile.bonusData.multiplier}</p>
                                <p className="text-purple-100 text-sm">Множитель</p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => setShowBonusSystem(true)}
                            className="w-full bg-white text-purple-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Управление бонусами
                        </button>
                    </div>
                </motion.section>

                <motion.section custom={3} initial="hidden" animate="visible" variants={sectionVariants}>
                    <NextRewardCard 
                        reward={profile.currentReward} 
                        stamps={profile.stamps}
                        stampsToReward={profile.stampsToReward}
                        onClaim={handleClaimReward}
                        isClaimable={isRewardClaimable}
                    />
                </motion.section>
                
                <motion.section custom={4} initial="hidden" animate="visible" variants={sectionVariants}>
                    <AchievementList />
                </motion.section>

                <motion.section custom={5} initial="hidden" animate="visible" variants={sectionVariants}>
                    <PromotionBanner showAll={false} maxItems={2} />
                </motion.section>

                <motion.section custom={6} initial="hidden" animate="visible" variants={sectionVariants}>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">Статистика заказов</h2>
                     <div className="space-y-3">
                        <div className="bg-white p-4 rounded-2xl shadow-lg flex items-center gap-4 border border-slate-200/80">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <CurrencyDollarIcon className="w-7 h-7 text-green-500" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-slate-800">Всего потрачено</p>
                                <p className="text-sm text-slate-500">{profile.orderStats.totalSpent} ₸ за все время</p>
                            </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-2xl shadow-lg flex items-center gap-4 border border-slate-200/80">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <StarIcon className="w-7 h-7 text-orange-500" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-slate-800">Любимый напиток</p>
                                <p className="text-sm text-slate-500">{profile.orderStats.favoriteItem}</p>
                            </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-2xl shadow-lg flex items-center gap-4 border border-slate-200/80">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <TicketIcon className="w-7 h-7 text-blue-500" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-slate-800">Средний чек</p>
                                <p className="text-sm text-slate-500">{profile.orderStats.averageOrderValue} ₸ за заказ</p>
                            </div>
                        </div>
                    </div>
                </motion.section>
            </main>
        </div>
    );
};

export default UltimateProfilePage;