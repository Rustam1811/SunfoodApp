import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserIcon, ArrowRightIcon, ShoppingBagIcon, XMarkIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

// ===================================================================
//  ДАННЫЕ И ТИПЫ
// ===================================================================

export interface Story {
  id: number;
  type: 'image' | 'video';
  url: string;
  duration?: number;
  header?: string;
}

export interface StoryPack {
  id: number;
  userName: string;
  userAvatar: string;
  stories: Story[];
}

const mockUser = {
    name: "Алекс",
    avatar: "https://images.unsplash.com/photo-1531123414780-f74242c2b052?auto=format&fit=crop&w=300&h=300&q=80",
    isNew: false,
    favoriteDrink: {
        name: "Капучино",
        image: "https://images.unsplash.com/photo-1557006034-834c6c0d49c2?auto=format&fit=crop&w=800&q=80"
    }
};

const fakeStoriesData: StoryPack[] = [
  { id: 1, userName: "Акции", userAvatar: "https://images.unsplash.com/photo-1579954115545-b9cd7a5a8058?auto=format&fit=crop&w=300&h=300&q=80",
    stories: [
      { id: 1, type: 'image', url: 'https://images.unsplash.com/photo-1556742053-99d3e8e4f1a3?auto=format&fit=crop&w=900&h=1600&q=80', header: 'Двойные баллы всю неделю!' },
      { id: 2, type: 'image', url: 'https://images.unsplash.com/photo-1621873495933-a357c36a3862?auto=format&fit=crop&w=900&h=1600&q=80', header: 'Попробуйте наш новый чизкейк' },
    ]
  },
  { id: 2, userName: "Новинки", userAvatar: "https://images.unsplash.com/photo-1507133750040-4a8f570215de?auto=format&fit=crop&w=300&h=300&q=80",
    stories: [
      { id: 3, type: 'video', url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4', duration: 10, header: 'Магия в каждой чашке' }
    ]
  },
];

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

const StoryBubble = ({ pack, onClick, hasBeenViewed }: { pack: StoryPack, onClick: () => void, hasBeenViewed: boolean }) => (
    <div onClick={onClick} className="text-center w-[76px] flex-shrink-0 cursor-pointer group">
        <div className={`w-[76px] h-[76px] rounded-full p-0.5 transition-all duration-300 transform group-hover:scale-105 ${hasBeenViewed ? 'bg-slate-200' : 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-500'}`}>
            <div className="bg-slate-50 p-1 rounded-full w-full h-full"><img src={pack.userAvatar} alt={pack.userName} className="w-full h-full object-cover rounded-full"/></div>
        </div>
        <p className="text-xs font-medium text-slate-600 mt-2 truncate group-hover:text-slate-900 transition-colors">{pack.userName}</p>
    </div>
);

const StoryProgress = ({ stories, currentStoryIndex, onFinish }: { stories: Story[], currentStoryIndex: number, onFinish: () => void }) => (
    <div className="absolute top-4 left-4 right-4 flex gap-1.5 z-20">
        {stories.map((story, index) => (
            <div key={story.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                {index < currentStoryIndex && <div className="h-full bg-white w-full"/>}
                {index === currentStoryIndex && (<motion.div className="h-full bg-white" initial={{ width: "0%" }} animate={{ width: "100%" }} onAnimationComplete={onFinish} transition={{ duration: (story.duration || 7), ease: "linear" }} />)}
            </div>
        ))}
    </div>
);

const StoryViewer = ({ storyPacks, initialPackIndex, onClose }: { storyPacks: StoryPack[], initialPackIndex: number, onClose: () => void }) => {
    const [currentPackIndex, setCurrentPackIndex] = useState(initialPackIndex);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const currentPack = storyPacks[currentPackIndex];
    const currentStory = currentPack.stories[currentStoryIndex];

    const handleNext = useCallback(() => {
        if (currentStoryIndex < currentPack.stories.length - 1) { setCurrentStoryIndex(p => p + 1); } 
        else if (currentPackIndex < storyPacks.length - 1) { setCurrentPackIndex(p => p + 1); setCurrentStoryIndex(0); } 
        else { onClose(); }
    }, [currentStoryIndex, currentPackIndex, currentPack.stories.length, storyPacks.length, onClose]);
    
    const handlePrev = useCallback(() => {
        if (currentStoryIndex > 0) { setCurrentStoryIndex(p => p - 1); } 
        else if (currentPackIndex > 0) {
            const prevPackIndex = currentPackIndex - 1;
            setCurrentPackIndex(prevPackIndex);
            setCurrentStoryIndex(storyPacks[prevPackIndex].stories.length - 1);
        }
    }, [currentStoryIndex, currentPackIndex, storyPacks]);

    useEffect(() => {
        const timer = setTimeout(handleNext, (currentStory.duration || 7) * 1000);
        return () => clearTimeout(timer);
    }, [currentStory, handleNext]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
            <AnimatePresence mode="wait">
                <motion.div key={currentStory.id} className="absolute inset-0 w-full h-full" initial={{ opacity: 0.8 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                    {currentStory.type === 'image' && <img src={currentStory.url} className="w-full h-full object-cover"/>}
                    {currentStory.type === 'video' && <video src={currentStory.url} className="w-full h-full object-cover" autoPlay muted playsInline/>}
                </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <StoryProgress stories={currentPack.stories} currentStoryIndex={currentStoryIndex} onFinish={handleNext} />
            <div className="absolute top-8 left-4 text-white z-20 flex items-center gap-3"><img src={currentPack.userAvatar} className="w-8 h-8 rounded-full object-cover"/><span className="font-bold text-sm drop-shadow">{currentPack.userName}</span></div>
            <h2 className="absolute bottom-8 left-4 right-4 text-3xl font-bold text-white drop-shadow-lg z-20">{currentStory.header}</h2>
            <button onClick={onClose} className="absolute top-8 right-4 text-white/70 hover:text-white z-20 p-1"><XMarkIcon className="w-7 h-7"/></button>
            <div className="absolute left-0 top-0 h-full w-1/3 z-10" onClick={handlePrev}/>
            <div className="absolute right-0 top-0 h-full w-1/3 z-10" onClick={handleNext}/>
        </motion.div>
    );
};

// ===================================================================
//  ГЛАВНЫЙ КОМПОНЕНТ СТРАНИЦЫ
// ===================================================================

const HomePage: React.FC = () => {
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [initialStoryIndex, setInitialStoryIndex] = useState(0);
    const [viewedPacks, setViewedPacks] = useState<Set<number>>(new Set());

    const openStoryViewer = (packIndex: number) => {
        setInitialStoryIndex(packIndex);
        setIsViewerOpen(true);
        setViewedPacks(prev => new Set(prev).add(fakeStoriesData[packIndex].id));
    };
    
    return (
        <div className="bg-slate-100 min-h-screen font-sans">
            <header className="p-4 flex justify-between items-center sticky top-0 bg-slate-100/80 backdrop-blur-lg z-20 border-b border-slate-900/10">
                <h1 className="text-2xl font-extrabold text-slate-900">Coffee Addict</h1>
                <ProfilePill name={mockUser.name} avatar={mockUser.avatar} />
            </header>

            <main className="p-4 space-y-10 pb-28">
                
                {/* 1. Сторис (Вовлечение) */}
                <section>
                    <div className="flex space-x-4 overflow-x-auto -mx-4 px-4 pb-2" style={{scrollbarWidth: 'none'}}>
                        {fakeStoriesData.map((pack, index) => (
                            <StoryBubble key={pack.id} pack={pack} onClick={() => openStoryViewer(index)} hasBeenViewed={viewedPacks.has(pack.id)} />
                        ))}
                    </div>
                </section>

                {/* 2. Персональный блок (Эффективность) */}
                <section>
                     <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 p-6">
                        <div className="flex items-center gap-4">
                            <img src={mockUser.favoriteDrink.image} className="w-16 h-16 rounded-2xl object-cover" />
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">С возвращением, {mockUser.name}!</h2>
                                <p className="text-slate-500">Ваш любимый {mockUser.favoriteDrink.name} ждет.</p>
                            </div>
                        </div>
                         <motion.button whileTap={{ scale: 0.95 }} onClick={() => alert('Быстрый заказ!')}
                            className="mt-4 w-full bg-slate-900 text-white font-bold py-3 px-5 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:bg-slate-700 transition-colors">
                            <ShoppingBagIcon className="w-5 h-5" /> Заказать в 1 клик
                        </motion.button>
                    </div>
                </section>
                
                {/* 3. Кураторская подборка (Открытие) */}
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

                {/* 4. Главный баннер-акция (Маркетинг) */}
                <section>
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl h-48 flex items-end p-6 text-white">
                        <img src={promoBannerData.image} className="absolute inset-0 w-full h-full object-cover brightness-75"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="relative">
                            <h3 className="text-2xl font-extrabold">{promoBannerData.title}</h3>
                            <button className="text-sm font-bold mt-2 flex items-center gap-1 hover:underline">
                                {promoBannerData.cta} <ArrowRightIcon className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>
                </section>

            </main>
            
            <AnimatePresence>
                {isViewerOpen && (
                    <StoryViewer
                        storyPacks={fakeStoriesData}
                        initialPackIndex={initialStoryIndex}
                        onClose={() => setIsViewerOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default HomePage;