import React, { useState, useEffect } from 'react';
// ✨ ИСПРАВЛЕНО: Импортируем тип Variants для анимации
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { FiAward, FiStar, FiTrendingUp, FiGift, FiChevronDown, FiLogOut } from 'react-icons/fi';

// ===================================================================
//  ДАННЫЕ И ТИПЫ
// ===================================================================

const userProfile = {
    name: "Манарбек",
    level: "Connoisseur",
    nextLevel: "Master",
    points: 185,
    pointsToNextLevel: 250,
    get progress() { return (this.points / this.pointsToNextLevel) * 100 },
    streak: 7,
    totalOrders: 42,
    savedAmount: 1250,
    // ✨ ИСПРАВЛЕНО: Добавлено недостающее свойство
    todaysBonus: 15,
    achievements: [
        { id: 1, name: "First Order", unlocked: true, icon: "☕", rarity: "common" },
        { id: 2, name: "Week Streak", unlocked: true, icon: "🔥", rarity: "rare" },
        { id: 3, name: "Coffee Expert", unlocked: true, icon: "🧪", rarity: "epic" },
        { id: 4, name: "Morning Ritual", unlocked: false, icon: "☀️", rarity: "legendary" },
        { id: 5, name: "VIP Status", unlocked: false, icon: "👑", rarity: "legendary" },
    ],
    personalOffers: [
        { id: 1, title: "Double Points Friday", discount: "2x Points", expires: "Today", urgent: true },
        { id: 2, title: "Free Extra Shot", discount: "Free", expires: "3 days", urgent: false },
        { id: 3, title: "20% Off Favorite", discount: "20%", expires: "1 week", urgent: false },
    ]
};

// ===================================================================
//  СТИЛИЗОВАННЫЕ КОМПОНЕНТЫ
// ===================================================================

const ProfileCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white rounded-2xl shadow-lg ${className}`}>
        {children}
    </div>
);

// ✨ ИСПРАВЛЕНО: свойство `trend` сделано необязательным
const StatCard = ({ icon, value, label, trend = null }: { icon: React.ReactNode, value: React.ReactNode, label: string, trend?: number | null }) => (
    <ProfileCard className="p-4 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
            {icon}
        </div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
        {trend && <p className="text-xs text-emerald-500 font-semibold mt-1 flex items-center justify-center gap-1"><FiTrendingUp/> +{trend}</p>}
    </ProfileCard>
);

const AchievementIcon = ({ achievement }: { achievement: { unlocked: boolean, rarity: string, icon: string, name: string } }) => {
    const rarityStyles: { [key: string]: string } = {
        common: "bg-slate-200 text-slate-600",
        rare: "bg-blue-100 text-blue-600",
        epic: "bg-purple-100 text-purple-600",
        legendary: "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/40"
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 transform hover:-translate-y-1
                ${achievement.unlocked ? rarityStyles[achievement.rarity] : "bg-slate-200 text-slate-400"}`}>
                {achievement.unlocked ? achievement.icon : "?"}
                {achievement.unlocked && achievement.rarity === 'legendary' && (
                    <div className="absolute inset-0 border-2 border-amber-400 rounded-2xl animate-pulse"/>
                )}
            </div>
            <p className="text-xs text-slate-600 text-center">{achievement.name}</p>
        </div>
    );
};

// ===================================================================
//  ГЛАВНАЯ КОМПОНЕНТ СТРАНИЦЫ
// ===================================================================

export default function AiryProfilePageFixed() {
    const [showAllOffers, setShowAllOffers] = useState(false);

    // ✨ ИСПРАВЛЕНО: Добавлен тип `Variants` для объекта анимации
    const sectionVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.15,
                duration: 0.5,
                ease: "easeOut" // Теперь TypeScript знает, что это допустимый тип Easing
            }
        })
    };

    return (
        <div className="bg-slate-100 min-h-screen font-sans">
            <main className="p-5 space-y-6 pb-20">
                
                <motion.section custom={0} initial="hidden" animate="visible" variants={sectionVariants}>
                    <ProfileCard className="p-6 text-center">
                        <h1 className="text-4xl font-extrabold text-slate-900">{userProfile.name}</h1>
                        <div className="inline-flex items-center gap-2 mt-2 bg-slate-200 text-slate-700 px-4 py-1.5 rounded-full text-sm font-semibold">
                            <FiAward className="text-amber-500" />
                            {userProfile.level}
                        </div>
                        <div className="mt-6 space-y-2">
                             <div className="w-full bg-slate-200 rounded-full h-2.5">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${userProfile.progress}%` }}
                                    transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                                />
                            </div>
                            <p className="text-sm text-slate-600">
                                <span className="font-bold text-slate-800">{userProfile.points}</span> / {userProfile.pointsToNextLevel} очков до уровня "{userProfile.nextLevel}"
                            </p>
                        </div>
                    </ProfileCard>
                </motion.section>

                <motion.section custom={1} initial="hidden" animate="visible" variants={sectionVariants} className="grid grid-cols-3 gap-4">
                    <StatCard icon={<FiStar size={24} className="text-amber-500" />} value={userProfile.points} label="Баллы" trend={userProfile.todaysBonus} />
                    <StatCard icon={<FiTrendingUp size={24} className="text-emerald-500" />} value={userProfile.streak} label="Дней подряд" />
                    <StatCard icon={<FiGift size={24} className="text-rose-500" />} value={`${userProfile.savedAmount} ₸`} label="Сэкономлено" />
                </motion.section>

                <motion.section custom={2} initial="hidden" animate="visible" variants={sectionVariants}>
                    <ProfileCard className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-slate-800">Для вас</h2>
                            <button onClick={() => setShowAllOffers(!showAllOffers)} className="text-sm font-semibold text-amber-600 flex items-center gap-1">
                                <span>{showAllOffers ? "Скрыть" : "Все"}</span>
                                <motion.div animate={{ rotate: showAllOffers ? 180 : 0 }}><FiChevronDown /></motion.div>
                            </button>
                        </div>
                        <div className="space-y-3">
                            <AnimatePresence>
                            {userProfile.personalOffers.slice(0, showAllOffers ? 3 : 1).map(offer => (
                                <motion.div key={offer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, padding: 0, margin: 0 }}>
                                    <div className={`p-4 rounded-xl flex items-center gap-4 transition-colors ${offer.urgent ? "bg-amber-100/60 border border-amber-200" : "bg-slate-100 hover:bg-slate-200"}`}>
                                        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg ${offer.urgent ? "bg-gradient-to-br from-amber-500 to-orange-500" : "bg-slate-300"}`}>
                                            {offer.discount}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">{offer.title}</p>
                                            <p className="text-xs text-slate-500">Истекает: {offer.expires}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            </AnimatePresence>
                        </div>
                    </ProfileCard>
                </motion.section>

                <motion.section custom={3} initial="hidden" animate="visible" variants={sectionVariants}>
                    <ProfileCard className="p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Достижения</h2>
                        <div className="grid grid-cols-5 gap-4">
                            {userProfile.achievements.map(ach => <AchievementIcon key={ach.id} achievement={ach} />)}
                        </div>
                    </ProfileCard>
                </motion.section>
                
                 <motion.section custom={4} initial="hidden" animate="visible" variants={sectionVariants}>
                    <button className="w-full bg-white py-3 rounded-xl text-red-500 font-semibold shadow-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                        <FiLogOut />
                        Выйти
                    </button>
                 </motion.section>

            </main>
        </div>
    );
}