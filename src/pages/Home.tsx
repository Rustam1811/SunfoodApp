import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiUser, FiX } from 'react-icons/fi';

// ===================================================================
//  ДАННЫЕ И ТИПЫ
// ===================================================================

const hero = {
    src: "https://images.unsplash.com/photo-1551030173-1a29929e716c?auto=format&fit=crop&w=1200&h=600&q=80",
    title: "Моменты чистого вкуса",
    subtitle: "Откройте для себя наш лучший кофе, созданный с любовью"
};
const favorites = [
    { src: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=500&h=500&q=80", name: "Холодный кофе" },
    { src: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=500&h=500&q=80", name: "Латте Арт" },
];
const offers = [
    { src: "https://images.unsplash.com/photo-1507133750040-4a8f570215de?auto=format&fit=crop&w=800&h=600&q=80", title: "Двойные баллы по пятницам", desc: "Получайте в два раза больше баллов лояльности за каждый заказ." },
    { src: "https://images.unsplash.com/photo-1608079635298-c2693a43c64e?auto=format&fit=crop&w=800&h=600&q=80", title: "Новый сезонный напиток", desc: "Попробуйте наш тыквенно-пряный латте. Доступно ограниченное время!" },
];

// ✨ НОВАЯ СТРУКТУРА ДАННЫХ ДЛЯ СТОРИС
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
const fakeStoriesData: StoryPack[] = [
  { id: 1, userName: "Акции", userAvatar: "https://images.unsplash.com/photo-1579954115545-b9cd7a5a8058?auto=format&fit=crop&w=300&h=300&q=80",
    stories: [
      { id: 1, type: 'image', url: 'https://images.unsplash.com/photo-1556742053-99d3e8e4f1a3?auto=format&fit=crop&w=900&h=1600&q=80', header: 'Двойные баллы всю неделю!' },
      { id: 2, type: 'image', url: 'https://images.unsplash.com/photo-1621873495933-a357c36a3862?auto=format&fit=crop&w=900&h=1600&q=80', header: 'Попробуйте наш новый чизкейк' },
    ]
  },
  { id: 2, userName: "Процесс", userAvatar: "https://images.unsplash.com/photo-1507133750040-4a8f570215de?auto=format&fit=crop&w=300&h=300&q=80",
    stories: [ { id: 3, type: 'video', url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4', duration: 10, header: 'Магия в каждой чашке' } ]
  },
  { id: 3, userName: "Бариста", userAvatar: "https://images.unsplash.com/photo-1525875953835-6b2651633535?auto=format&fit=crop&w=300&h=300&q=80",
    stories: [ { id: 4, type: 'image', url: 'https://images.unsplash.com/photo-1572173142279-34ff245a4675?auto=format&fit=crop&w=900&h=1600&q=80', header: 'Знакомьтесь, ваша смена сегодня!' } ]
  }
];

// ===================================================================
//  СТИЛИЗОВАННЫЕ КОМПОНЕНТЫ
// ===================================================================

const ProfilePill = ({ name }) => (
    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm shadow-md rounded-full p-1 pr-4">
        <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center"><FiUser className="text-slate-600" /></div>
        <span className="font-semibold text-slate-800 text-sm">Привет, {name}</span>
    </div>
);

const ContentCard = ({ item }) => (
    <motion.div className="bg-white rounded-2xl shadow-lg overflow-hidden group cursor-pointer" whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300 } }}>
        <div className="overflow-hidden">
            <img src={item.src} alt={item.title || item.name} loading="lazy" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="p-5">
            <h3 className="font-bold text-lg text-slate-800">{item.title || item.name}</h3>
            {item.desc && <p className="text-slate-600 text-sm mt-1">{item.desc}</p>}
        </div>
    </motion.div>
);

// ✨ НОВЫЕ КОМПОНЕНТЫ ДЛЯ СТОРИС
const StoryBubble = ({ pack, onClick, hasBeenViewed }) => (
    <div onClick={onClick} className="text-center w-20 flex-shrink-0 cursor-pointer group">
        <div className={`w-20 h-20 rounded-full p-1 transition-all duration-300 transform group-hover:scale-105 ${hasBeenViewed ? 'bg-slate-200' : 'bg-gradient-to-tr from-amber-500 to-orange-500'}`}>
            <div className="bg-white p-1 rounded-full w-full h-full">
                <img src={pack.userAvatar} alt={pack.userName} className="w-full h-full object-cover rounded-full"/>
            </div>
        </div>
        <p className="text-xs font-semibold text-slate-700 mt-2 truncate group-hover:text-slate-900 transition-colors">{pack.userName}</p>
    </div>
);

const StoryProgress = ({ stories, currentStoryIndex, isPaused }) => (
    <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
        {stories.map((story, index) => (
            <div key={story.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                {index < currentStoryIndex && <div className="h-full bg-white w-full"/>}
                {index === currentStoryIndex && (
                    <motion.div className="h-full bg-white" initial={{ width: "0%" }} animate={{ width: "100%" }}
                        transition={{ duration: isPaused ? 0 : (story.duration || 5), ease: "linear" }}
                    />
                )}
            </div>
        ))}
    </div>
);

// ===================================================================
//  ГЛАВНЫЙ КОМПОНЕНТ СТРАНИЦЫ
// ===================================================================

export default function AiryHomePageWithStories() {
    // ✨ НОВОЕ СОСТОЯНИЕ ДЛЯ УПРАВЛЕНИЯ СТОРИС
    const [activeStoryPack, setActiveStoryPack] = useState<StoryPack | null>(null);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [viewedPacks, setViewedPacks] = useState<Set<number>>(new Set());

    const handleNextStory = useCallback(() => {
        if (!activeStoryPack) return;
        const isLastStoryInPack = currentStoryIndex >= activeStoryPack.stories.length - 1;
        const currentGlobalIndex = fakeStoriesData.findIndex(p => p.id === activeStoryPack.id);
        const isLastPack = currentGlobalIndex >= fakeStoriesData.length - 1;

        if (isLastStoryInPack && isLastPack) {
            setActiveStoryPack(null); // Закрываем, если это последняя сторис в последнем паке
        } else if (isLastStoryInPack) {
            const nextPack = fakeStoriesData[currentGlobalIndex + 1];
            setActiveStoryPack(nextPack);
            setCurrentStoryIndex(0);
            setViewedPacks(prev => new Set(prev).add(nextPack.id));
        } else {
            setCurrentStoryIndex(prev => prev + 1);
        }
    }, [activeStoryPack, currentStoryIndex]);

    const handlePrevStory = useCallback(() => {
        if (!activeStoryPack) return;
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1);
        } else {
            const currentGlobalIndex = fakeStoriesData.findIndex(p => p.id === activeStoryPack.id);
            if (currentGlobalIndex > 0) {
                const prevPack = fakeStoriesData[currentGlobalIndex - 1];
                setActiveStoryPack(prevPack);
                setCurrentStoryIndex(prevPack.stories.length - 1);
            }
        }
    }, [activeStoryPack, currentStoryIndex]);
    
    useEffect(() => {
        if (activeStoryPack && !isPaused) {
            const story = activeStoryPack.stories[currentStoryIndex];
            const timer = setTimeout(handleNextStory, (story.duration || 5) * 1000);
            return () => clearTimeout(timer);
        }
    }, [activeStoryPack, currentStoryIndex, isPaused, handleNextStory]);

    const openStoryViewer = (pack: StoryPack) => {
        setActiveStoryPack(pack);
        setCurrentStoryIndex(0);
        setViewedPacks(prev => new Set(prev).add(pack.id));
    };
    
    const closeStoryViewer = () => setActiveStoryPack(null);

    const currentStory = activeStoryPack?.stories[currentStoryIndex];

    return (
        <div className="bg-slate-100 min-h-screen font-sans text-slate-900">
            <header className="p-5 flex justify-between items-center">
                <h1 className="text-2xl font-extrabold text-slate-900">Coffee Addict</h1>
                <ProfilePill name="Алекс" />
            </header>

            <main className="px-5 space-y-8 pb-20">
                <motion.section layout>
                    <div className="flex space-x-4 overflow-x-auto -mx-5 px-5 pb-2" style={{ scrollbarWidth: 'none' }}>
                        {fakeStoriesData.map((pack) => (
                            <StoryBubble key={pack.id} pack={pack} onClick={() => openStoryViewer(pack)} hasBeenViewed={viewedPacks.has(pack.id)} />
                        ))}
                    </div>
                </motion.section>

                <motion.section
                    layout transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    className="relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer"
                    style={{ height: activeStoryPack ? `min(600px, calc(100vh - 220px))` : '320px' }}
                    onMouseDown={() => setIsPaused(true)} onMouseUp={() => setIsPaused(false)} onMouseLeave={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)}
                >
                    <AnimatePresence initial={false}>
                        <motion.div
                            key={activeStoryPack ? `story-${currentStory?.id}` : 'hero'}
                            className="absolute inset-0"
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                        >
                            {activeStoryPack && currentStory ? (
                                <>
                                    {currentStory.type === 'image' && <img src={currentStory.url} className="w-full h-full object-cover"/>}
                                    {currentStory.type === 'video' && <video src={currentStory.url} className="w-full h-full object-cover" autoPlay muted playsInline/>}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
                                </>
                            ) : (
                                <>
                                    <img src={hero.src} alt="Coffee beans" className="absolute inset-0 w-full h-full object-cover brightness-75" />
                                    <div className="bg-gradient-to-t from-black/60 to-transparent absolute inset-0" />
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {activeStoryPack && currentStory ? (
                        <>
                            <StoryProgress stories={activeStoryPack.stories} currentStoryIndex={currentStoryIndex} isPaused={isPaused}/>
                            <div className="absolute bottom-8 left-8 text-white z-20">
                                <h2 className="text-3xl font-bold drop-shadow-lg">{currentStory.header}</h2>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); closeStoryViewer(); }} className="absolute top-4 right-4 text-white z-20 p-2 bg-black/30 rounded-full"><FiX size={24}/></button>
                            <div className="absolute left-0 top-0 h-full w-1/3 z-10" onClick={(e) => { e.stopPropagation(); handlePrevStory(); }}/>
                            <div className="absolute right-0 top-0 h-full w-1/3 z-10" onClick={(e) => { e.stopPropagation(); handleNextStory(); }}/>
                        </>
                    ) : (
                        <div className="relative h-full flex flex-col justify-between p-8 text-white">
                            <div>
                                <h2 className="text-4xl font-extrabold drop-shadow-lg">{hero.title}</h2>
                                <p className="text-lg text-white/90 mt-2 max-w-sm drop-shadow-md">{hero.subtitle}</p>
                            </div>
                            <motion.button whileTap={{ scale: 0.95 }} className="self-start bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center gap-2">
                                Начать заказ <FiArrowRight />
                            </motion.button>
                        </div>
                    )}
                </motion.section>

                <AnimatePresence>
                {!activeStoryPack && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: {delay: 0.2} }} exit={{ opacity: 0 }} className="space-y-12">
                        <section>
                             <h2 className="text-2xl font-bold text-slate-800 mb-5">🔥 Эксклюзивные предложения</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{offers.map((offer, i) => (<ContentCard key={i} item={offer} />))}</div>
                        </section>
                        <section>
                             <h2 className="text-2xl font-bold text-slate-800 mb-5">🌿 Ваши фавориты</h2>
                             <div className="flex space-x-6 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                 {favorites.map((item, idx) => (<div key={idx} className="flex-shrink-0 w-56"><ContentCard item={item} /></div>))}
                             </div>
                        </section>
                    </motion.div>
                )}
                </AnimatePresence>
            </main>
        </div>
    );
}