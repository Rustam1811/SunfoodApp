import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ApiService } from '../services/apiConfig';

interface Story {
  id: string;
  title: string;
  content: {
    type: 'image' | 'video' | 'text';
    url?: string;
    text?: string;
    backgroundColor?: string;
  };
  duration?: number;
}

interface Props {
  stories: Story[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onMarkViewed: (id: string) => void;
}

export const StoryViewer: React.FC<Props> = ({
  stories,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
  onMarkViewed,
}) => {
  // --- Главная защита ---
  if (
    !Array.isArray(stories) ||
    !stories.length ||
    typeof currentIndex !== 'number' ||
    !stories[currentIndex] ||
    !stories[currentIndex].content
  ) {
    return null;
  }

  const currentStory = stories[currentIndex];
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const frameRef = useRef(0);
  const rafId = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const duration = (currentStory?.duration || 5) * 1000;

  const loop = useCallback(
    (timestamp: number) => {
      if (!frameRef.current) frameRef.current = timestamp;
      const delta = timestamp - frameRef.current;

      if (!paused) {
        const newProgress = Math.min(100, (delta / duration) * 100);
        setProgress(newProgress);
        if (newProgress >= 100) {
          onMarkViewed(currentStory.id);
          currentIndex < stories.length - 1 ? onNext() : onClose();
          frameRef.current = 0;
          return;
        }
      }
      rafId.current = requestAnimationFrame(loop);
    },
    [paused, duration, currentStory.id, currentIndex, onClose, onNext, onMarkViewed, stories.length]
  );

  useEffect(() => {
    rafId.current = requestAnimationFrame(loop);
    return () => rafId.current && cancelAnimationFrame(rafId.current);
  }, [loop]);

  useEffect(() => {
    setProgress(0);
    frameRef.current = 0;
  }, [currentIndex]);

  const handleSwipe = (e: React.TouchEvent<HTMLDivElement>) => {
    const touchStartY = e.touches[0].clientY;
    const handleEnd = (ev: TouchEvent) => {
      const deltaY = ev.changedTouches[0].clientY - touchStartY;
      if (deltaY > 80) onClose();
      window.removeEventListener('touchend', handleEnd);
    };
    window.addEventListener('touchend', handleEnd);
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] bg-black flex flex-col"
        style={{ height: '100dvh', overscrollBehavior: 'none' }}
        onTouchStart={handleSwipe}
      >
        {/* Progress */}
        <div className="absolute top-4 left-4 right-4 flex space-x-1 z-20">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                style={{
                  width:
                    i < currentIndex
                      ? '100%'
                      : i === currentIndex
                      ? `${progress}%`
                      : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Close Button */}
        <div className="absolute top-4 right-4 z-30">
          <button onClick={onClose} className="p-2 bg-black/50 rounded-full">
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Tap Zones */}
        <div className="absolute inset-0 z-10 flex">
          <button
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="flex-1"
          />
          <button
            onClick={onNext}
            disabled={currentIndex === stories.length - 1}
            className="flex-1"
          />
        </div>

        {/* Content */}
        <div
          className="flex-1 flex items-center justify-center text-white text-center p-4 select-none"
          onMouseDown={() => setPaused(true)}
          onMouseUp={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        >
          {currentStory.content.type === 'image' && currentStory.content.url ? (
            <img
              src={currentStory.content.url}
              alt={currentStory.title}
              className="max-w-full max-h-full object-contain"
            />
          ) : currentStory.content.type === 'video' && currentStory.content.url ? (
            <video
              src={currentStory.content.url}
              autoPlay
              muted
              playsInline
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div
              style={{
                backgroundColor:
                  currentStory.content.backgroundColor || '#333',
              }}
              className="w-full h-full flex items-center justify-center"
            >
              <h1 className="text-3xl font-bold">{currentStory.title}</h1>
              {currentStory.content.text && (
                <div className="mt-2 text-lg">{currentStory.content.text}</div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

// Основной компонент Stories для отображения списка сторисов
interface StoriesProps {
  onStoryClick: (story: Story) => void;
}

const Stories: React.FC<StoriesProps> = ({ onStoryClick }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const data = await ApiService.stories.getAll();
        
        // Фильтруем только активные сторисы
        const activeStories = data.filter((story: any) => {
          if (!story.isActive) return false;
          // Проверяем, не истёк ли срок действия (24 часа)
          const createdAt = new Date(story.createdAt?.toDate ? story.createdAt.toDate() : story.createdAt);
          const now = new Date();
          const hoursPassed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
          return hoursPassed < 24;
        });
        
        setStories(activeStories);
      } catch (error) {
        console.error('Ошибка загрузки сторисов:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  const handleMarkViewed = async (storyId: string) => {
    try {
      await ApiService.stories.incrementView(storyId);
    } catch (error) {
      console.error('Ошибка увеличения просмотров:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex space-x-3 px-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  if (stories.length === 0) {
    return null; // Не показываем ничего, если нет активных сторисов
  }

  return (
    <div className="relative">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 px-2">Истории</h3>
      <div className="flex space-x-3 overflow-x-auto scrollbar-hide px-2 pb-2">
        {stories.map((story) => (
          <motion.div
            key={story.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onStoryClick(story)}
            className="flex flex-col items-center space-y-2 cursor-pointer flex-shrink-0"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-400 via-pink-500 to-red-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-white p-[2px]">
                  {story.content.type === 'image' && story.content.url ? (
                    <img
                      src={story.content.url}
                      alt={story.title}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : story.content.type === 'video' && story.content.url ? (
                    <video
                      src={story.content.url}
                      className="w-full h-full rounded-full object-cover"
                      muted
                    />
                  ) : (
                    <div
                      style={{
                        backgroundColor: story.content.backgroundColor || '#6366f1',
                      }}
                      className="w-full h-full rounded-full flex items-center justify-center"
                    >
                      <span className="text-white text-xs font-bold">
                        {story.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <span className="text-xs text-slate-600 text-center max-w-[60px] truncate">
              {story.title}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Stories;
