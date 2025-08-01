import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

interface Story {
  id: string;
  title: string;
  content: {
    type: 'image' | 'video' | 'text';
    url?: string;
    text?: string;
    backgroundColor?: string;
  };
  duration?: number; // для видео в секундах
  viewCount: number;
  isActive: boolean;
  expiresAt: any;
  createdAt: any;
}

interface StoryViewer {
  userId: string;
  storyId: string;
  viewedAt: any;
}

interface StoriesProps {
  className?: string;
  onStoryClick?: (story: Story) => void;
}

export const Stories: React.FC<StoriesProps> = ({ className = '', onStoryClick }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user?.uid || null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    loadStories();
    if (currentUser) {
      loadViewedStories();
    }
  }, [currentUser]);

  const loadStories = async () => {
    try {
      const response = await fetch('https://us-central1-coffeeaddict-c9d70.cloudfunctions.net/stories');
      if (response.ok) {
        const data = await response.json();
        const activeStories = (data.stories || []).filter((story: Story) => {
          const now = new Date();
          const expiresAt = new Date(story.expiresAt);
          return story.isActive && now < expiresAt;
        });
        
        setStories(activeStories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    } catch (error) {
      console.error('Ошибка загрузки историй:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadViewedStories = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch(`https://us-central1-coffeeaddict-c9d70.cloudfunctions.net/stories?userId=${currentUser}&action=getViewed`);
      if (response.ok) {
        const data = await response.json();
        const viewed = new Set<string>((data.viewedStories || []).map((v: StoryViewer) => v.storyId));
        setViewedStories(viewed);
      }
    } catch (error) {
      console.error('Ошибка загрузки просмотренных историй:', error);
    }
  };

  const markAsViewed = async (storyId: string) => {
    if (!currentUser || viewedStories.has(storyId)) return;

    try {
      await fetch('https://us-central1-coffeeaddict-c9d70.cloudfunctions.net/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser,
          storyId,
          action: 'view'
        }),
      });

      setViewedStories(prev => new Set([...prev, storyId]));
    } catch (error) {
      console.error('Ошибка при отметке просмотра:', error);
    }
  };

  const handleStoryClick = (story: Story) => {
    markAsViewed(story.id);
    onStoryClick?.(story);
  };

  if (loading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="flex space-x-3 overflow-x-auto">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0"></div>
          ))}
        </div>
      </div>
    );
  }

  if (stories.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <h2 className="text-lg font-bold text-gray-900 mb-3">Истории</h2>
      
      <div className="flex space-x-3 overflow-x-auto pb-2">
        {stories.map((story, index) => {
          const isViewed = viewedStories.has(story.id);
          
          return (
            <motion.button
              key={story.id}
              onClick={() => handleStoryClick(story)}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 focus:outline-none"
            >
              <div className={`relative w-16 h-16 rounded-full p-0.5 ${
                isViewed 
                  ? 'bg-gray-300' 
                  : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600'
              }`}>
                <div className="w-full h-full bg-white rounded-full p-0.5">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {story.content.type === 'image' && story.content.url ? (
                      <img 
                        src={story.content.url} 
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                    ) : story.content.type === 'video' && story.content.url ? (
                      <div className="relative w-full h-full bg-black flex items-center justify-center">
                        <PlayIcon className="w-6 h-6 text-white" />
                      </div>
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: story.content.backgroundColor || '#6B46C1' }}
                      >
                        {story.title.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                
                {!isViewed && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-600 mt-1 w-16 truncate text-center">
                {story.title}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

interface StoryViewerProps {
  stories: Story[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onMarkViewed: (storyId: string) => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
  onMarkViewed
}) => {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const currentStory = stories[currentIndex];
  const duration = currentStory?.duration || 5; // 5 секунд по умолчанию

  useEffect(() => {
    if (!currentStory || isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / (duration * 10)); // обновляем каждые 100мс
        
        if (newProgress >= 100) {
          onMarkViewed(currentStory.id);
          onNext();
          return 0;
        }
        
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentStory, isPaused, duration, onNext, onMarkViewed]);

  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  if (!currentStory) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      >
        {/* Прогресс бары */}
        <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
          {stories.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                style={{
                  width: index < currentIndex ? '100%' : 
                         index === currentIndex ? `${progress}%` : '0%'
                }}
                transition={{ duration: 0.1 }}
              />
            </div>
          ))}
        </div>

        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
        >
          <XMarkIcon className="w-5 h-5 text-white" />
        </button>

        {/* Контент истории */}
        <div 
          className="w-full h-full flex items-center justify-center"
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
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
              className="max-w-full max-h-full object-contain"
              autoPlay
              muted
              loop
            />
          ) : (
            <div 
              className="w-full h-full flex flex-col items-center justify-center p-8"
              style={{ backgroundColor: currentStory.content.backgroundColor || '#6B46C1' }}
            >
              <h1 className="text-2xl font-bold text-white text-center mb-4">
                {currentStory.title}
              </h1>
              {currentStory.content.text && (
                <p className="text-lg text-white text-center leading-relaxed">
                  {currentStory.content.text}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Невидимые области для навигации */}
        <button
          onClick={onPrevious}
          className="absolute left-0 top-0 w-1/3 h-full"
          disabled={currentIndex === 0}
        />
        <button
          onClick={onNext}
          className="absolute right-0 top-0 w-1/3 h-full"
        />

        {/* Информация о истории */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="flex items-center space-x-2 text-white">
            <EyeIcon className="w-4 h-4" />
            <span className="text-sm">{currentStory.viewCount} просмотров</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
