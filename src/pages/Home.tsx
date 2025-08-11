import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBagIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { StoriesContainer } from '../components/StoriesContainer';
import { PromotionBanner } from '../components/PromotionBanner';
import { AchievementList } from '../components/AchievementList';

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

const curatedListData = {
    title: "Идеально к вашему утру",
    items: [
        { id: 1, name: 'Двойной эспрессо', image: 'https://images.unsplash.com/photo-1608079635298-c2693a43c64e?auto=format&fit=crop&w=800&q=80' },
        { id: 2, name: 'Свежий круассан', image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80' },
        { id: 3, name: 'Фильтр-кофе', image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80' },
    ]
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

// ===================================================================
//  ГЛАВНЫЙ КОМПОНЕНТ СТРАНИЦЫ
// ===================================================================

const HomePage: React.FC = () => {
    const user = getUserData(); // Получаем данные пользователя
    
    return (
        <div className="bg-slate-100 min-h-screen font-sans">
            <header className="p-4 flex justify-between items-center sticky top-0 bg-slate-100/80 backdrop-blur-lg z-20 border-b border-slate-900/10">
                <h1 className="text-2xl font-extrabold text-slate-900">Coffee Addict</h1>
                <ProfilePill name={user.name} avatar={user.avatar} />
            </header>

            <main className="p-4 space-y-6 pb-28">
                
                {/* 1. Истории */}
                <StoriesContainer className="mb-6" showName={true} avatarSize={70} />

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