import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { UserIcon, TrophyIcon, TicketIcon, FireIcon, StarIcon, ChevronRightIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/solid';

// ===================================================================
//  ДАННЫЕ И ТИПЫ
// ===================================================================

const initialUserProfile = {
    name: "Манарбек",
    level: "Ценитель Кофе",
    avatar: "https://images.unsplash.com/photo-1531123414780-f74242c2b052?auto=format&fit=crop&w=300&h=300&q=80",
    points: 185,
    lastVisitToday: true,
    streak: 7,
    stamps: 10,
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
        { id: 1, name: "Первый заказ", unlocked: true, icon: "☕", isNew: false },
        { id: 2, name: "Стрик в неделю", unlocked: true, icon: "🔥", isNew: true },
        { id: 3, name: "Эксперт", unlocked: true, icon: "🧪", isNew: false },
        { id: 4, name: "Утренний ритуал", unlocked: false, icon: "☀️" },
        { id: 5, name: "VIP", unlocked: false, icon: "👑" },
    ],
    totalAchievements: 5,
    personalQuests: [
        { id: 1, title: "Попробуйте наш новый Раф", description: "Сделайте заказ на авторский напиток и получите +50 баллов." },
        { id: 2, title: "Скидка на ваш любимый напиток", description: "На этой неделе ваш Латте со скидкой 20%." },
    ]
};

// ===================================================================
//  КОМПОНЕНТЫ
// ===================================================================

const BalanceBar = ({ points, streak, lastVisitToday }) => (
    <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-lg flex items-center gap-3 border border-slate-200/60">
            <StarIcon className="w-8 h-8 text-yellow-400 flex-shrink-0"/>
            <div>
                <p className="text-2xl font-bold text-slate-900">{points}</p>
                <p className="text-xs text-slate-500">Бонусных баллов</p>
            </div>
        </div>
         <div className="bg-white p-4 rounded-2xl shadow-lg flex items-center gap-3 border border-slate-200/60">
            <FireIcon className={`w-8 h-8 flex-shrink-0 transition-colors ${lastVisitToday ? 'text-red-500' : 'text-slate-400'}`}/>
            <div>
                <p className="text-2xl font-bold text-slate-900">{streak}</p>
                <p className="text-xs text-slate-500">{lastVisitToday ? 'Дней стрик 🔥' : 'Стрик под угрозой!'}</p>
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
            <header className="p-4 flex items-center justify-between sticky top-0 bg-slate-50/80 backdrop-blur-lg z-20 border-b border-slate-900/10">
                <div className="w-10"></div>
                <h1 className="text-xl font-bold text-slate-900">Профиль</h1>
                <button className="p-2"><ArrowLeftOnRectangleIcon className="w-6 h-6 text-slate-500"/></button>
            </header>

            <main className="p-4 space-y-8 pb-28">
                <motion.section custom={0} initial="hidden" animate="visible" variants={sectionVariants}>
                    <div className="flex items-center gap-4">
                        <img src={profile.avatar} className="w-20 h-20 rounded-full object-cover shadow-lg" />
                        <div>
                            <h2 className="text-3xl font-extrabold">{profile.name}</h2>
                            <div className="inline-flex items-center gap-2 mt-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold">
                                <TrophyIcon className="w-5 h-5 text-amber-500" />
                                {profile.level}
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.section custom={1} initial="hidden" animate="visible" variants={sectionVariants}>
                    <BalanceBar points={profile.points} streak={profile.streak} lastVisitToday={profile.lastVisitToday} />
                </motion.section>

                <motion.section custom={2} initial="hidden" animate="visible" variants={sectionVariants}>
                    <NextRewardCard 
                        reward={profile.currentReward} 
                        stamps={profile.stamps}
                        stampsToReward={profile.stampsToReward}
                        onClaim={handleClaimReward}
                        isClaimable={isRewardClaimable}
                    />
                </motion.section>
                
                <motion.section custom={3} initial="hidden" animate="visible" variants={sectionVariants}>
                     <div className="flex justify-between items-center mb-3">
                        <h2 className="text-2xl font-bold text-slate-900">Достижения</h2>
                        <button className="font-semibold text-sm text-orange-600 flex items-center gap-1">
                            Все <ChevronRightIcon className="w-4 h-4"/>
                        </button>
                     </div>
                    <div className="flex space-x-4 overflow-x-auto -mx-4 px-4 pb-4" style={{scrollbarWidth: 'none'}}>
                        {profile.achievements.map(ach => (
                           <AchievementIcon key={ach.id} achievement={ach} />
                        ))}
                    </div>
                </motion.section>

                <motion.section custom={4} initial="hidden" animate="visible" variants={sectionVariants}>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">Персональные квесты</h2>
                     <div className="space-y-3">
                        {profile.personalQuests.map(quest => (
                            <div key={quest.id} className="bg-white p-4 rounded-2xl shadow-lg flex items-center gap-4 border border-slate-200/80">
                                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                    <TicketIcon className="w-7 h-7 text-orange-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-800">{quest.title}</p>
                                    <p className="text-sm text-slate-500">{quest.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.section>
            </main>
        </div>
    );
};

export default UltimateProfilePage;