import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserIcon, ArrowRightIcon, ShoppingBagIcon, XMarkIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import Stories from '../components/Stories_New';
import { PromotionBanner } from '../components/PromotionBanner';
import { AchievementList } from '../components/AchievementList';
import { ApiStatusIndicator } from '../components/ApiStatusIndicator';

// ===================================================================
//  ДАННЫЕ И ТИПЫ
// ===================================================================

// Получаем данные пользователя
const getUserData = () => {
    try {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            return {
                name: user.name || "Пользователь",
                avatar: user.avatar || "https://images.unsplash.com/photo-1531123414780-f74242c2b052?auto=format&fit=crop&w=300&h=300&q=80",
                isNew: user.isNew || false,
                favoriteDrink: user.favoriteDrink || {
                    name: "Капучино",
                    image: "https://images.unsplash.com/photo-1557006034-834c6c0d49c2?auto=format&fit=crop&w=800&q=80"
                }
            };
        }
    } catch (e) {
        console.error('Ошибка получения данных пользователя:', e);
    }
    return {
        name: "Пользователь",
        avatar: "https://images.unsplash.com/photo-1531123414780-f74242c2b052?auto=format&fit=crop&w=300&h=300&q=80",
        isNew: false,
        favoriteDrink: {
            name: "Капучино",
            image: "https://images.unsplash.com/photo-1557006034-834c6c0d49c2?auto=format&fit=crop&w=800&q=80"
        }
    };
};

const fakeStoriesData = [];

const curatedListData = {
    title: "Идеально к вашему утру",
    items: [
        { id: 1, name: 'Двойной эспрессо', image: 'https://images.unsplash.com/photo-1608079635298-c2693a43c64e?auto=format&fit=crop&w=800&q=80' },
        { id: 2, name: 'Свежий круассан', image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80' },
        { id: 3, name: 'Фильтр-кофе', image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80' },
    ]
};

const promoBannerData = { 
    title: 'Новое летнее меню!', 
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&h=600&q=80', 
    cta: 'Смотреть' 
};


// ===================================================================
//  КОМПОНЕНТЫ
// ===================================================================

const ProfilePill = ({ name, avatar }: { name: string; avatar: string; }) => (
    <div className="flex items-center gap-2 bg-white/60 backdrop-blur-lg rounded-full p-1 pr-3 border border-slate-200/80">
        <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover"/>
        <span className="font-semibold text-slate-800 text-sm">Привет, {name}</span>
    </div>
);

const StoryBubble = ({ pack, onClick, hasBeenViewed }: { pack: any, onClick: () => void, hasBeenViewed: boolean }) => (
    <div onClick={onClick} className="text-center w-[76px] flex-shrink-0 cursor-pointer group">
        <div className={`w-[76px] h-[76px] rounded-full p-0.5 transition-all duration-300 transform group-hover:scale-105 ${hasBeenViewed ? 'bg-slate-200' : 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-500'}`}>
            <div className="bg-slate-50 p-1 rounded-full w-full h-full"><img src={pack.userAvatar} alt={pack.userName} className="w-full h-full object-cover rounded-full"/></div>
        </div>
        <p className="text-xs font-medium text-slate-600 mt-2 truncate group-hover:text-slate-900 transition-colors">{pack.userName}</p>
    </div>
);

const StoryProgress = ({ stories, currentStoryIndex, onFinish }: { stories: any[], currentStoryIndex: number, onFinish: () => void }) => (
    <div className="absolute top-4 left-4 right-4 flex gap-1.5 z-20">
        {stories.map((story, index) => (
            <div key={story.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                {index < currentStoryIndex && <div className="h-full bg-white w-full"/>}
                {index === currentStoryIndex && (<motion.div className="h-full bg-white" initial={{ width: "0%" }} animate={{ width: "100%" }} onAnimationComplete={onFinish} transition={{ duration: (story.duration || 7), ease: "linear" }} />)}
            </div>
        ))}
    </div>
);

// ===================================================================
//  ГЛАВНЫЙ КОМПОНЕНТ СТРАНИЦЫ
// ===================================================================

const HomePage: React.FC = () => {
    const user = getUserData(); // Получаем данные пользователя
    
    return (
        <div className="bg-slate-100 min-h-screen font-sans">
            {/* API Status Indicator */}
            <ApiStatusIndicator />
            
            <header className="p-4 flex justify-between items-center sticky top-0 bg-slate-100/80 backdrop-blur-lg z-20 border-b border-slate-900/10">
                <h1 className="text-2xl font-extrabold text-slate-900">Coffee Addict</h1>
                <ProfilePill name={user.name} avatar={user.avatar} />
            </header>

            <main className="p-4 space-y-6 pb-28">
                
                {/* 1. Истории */}
                <Stories className="mb-6" />

                {/* 2. Акции */}
                <PromotionBanner 
                    maxItems={2}
                />

                {/* 3. Персональный блок */}
                <section>
                     <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 p-6">
                        <div className="flex items-center gap-4">
                            <img src={user.favoriteDrink.image} className="w-16 h-16 rounded-2xl object-cover" />
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">С возвращением, {user.name}!</h2>
                                <p className="text-slate-500">Ваш любимый {user.favoriteDrink.name} ждет.</p>
                            </div>
                        </div>
                         <motion.button whileTap={{ scale: 0.95 }} onClick={() => alert('Быстрый заказ!')}
                            className="mt-4 w-full bg-slate-900 text-white font-bold py-3 px-5 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:bg-slate-700 transition-colors">
                            <ShoppingBagIcon className="w-5 h-5" /> Заказать в 1 клик
                        </motion.button>
                    </div>
                </section>

                {/* 4. Достижения */}
                <AchievementList />
                
                {/* 5. Кураторская подборка */}
                <section>
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-slate-900">{curatedListData.title}</h2>
                        <button onClick={() => alert('Показать все')} className="font-semibold text-sm text-orange-600 flex items-center gap-1">
                            Все <ChevronRightIcon className="w-4 h-4"/>
                        </button>
                     </div>
                     <div className="flex space-x-4 overflow-x-auto -mx-4 px-4 pb-4" style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}>
                        {curatedListData.items.map(item => (
                            <div key={item.id} className="flex-shrink-0 w-40" style={{ scrollSnapAlign: 'start' }}>
                                <div className="bg-white rounded-2xl shadow-lg overflow-hidden group cursor-pointer">
                                    <img src={item.image} className="w-full h-32 object-cover" />
                                    <h3 className="font-semibold text-sm text-slate-800 p-3">{item.name}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
};

export default HomePage;