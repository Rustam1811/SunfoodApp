import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/outline';
import { ApiService } from '../services/apiConfig';
import { Story } from '../types/story';

interface StoriesProps {
  className?: string;
}

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

// Генерируем sessionId для анонимных пользователей
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('story_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('story_session_id', sessionId);
  }
  return sessionId;
};

const StoryViewer: React.FC<StoryViewerProps> = ({ stories, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const currentStory = stories[currentIndex];

  useEffect(() => {
    // Записываем просмотр текущей story
    if (currentStory && !viewedStories.has(currentStory.id)) {
      recordView(currentStory.id);
      setViewedStories(prev => new Set([...prev, currentStory.id]));
    }

    // Запускаем прогресс-бар
    startProgress();

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentIndex]);

  const recordView = async (storyId: string) => {
    try {
      await fetch(`http://localhost:3000/api/stories/${storyId}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: getSessionId() })
      });
    } catch (error) {
      console.error('Ошибка записи просмотра:', error);
    }
  };

  const startProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    setProgress(0);
    startTimeRef.current = Date.now();

    progressIntervalRef.current = setInterval(() => {
      if (!isPaused) {
        const elapsed = Date.now() - startTimeRef.current;
        const newProgress = (elapsed / currentStory.duration) * 100;

        if (newProgress >= 100) {
          nextStory();
        } else {
          setProgress(newProgress);
        }
      }
    }, 50);
  };

  const nextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      // Пауза - сохраняем текущее время
      startTimeRef.current = Date.now() - (progress / 100) * currentStory.duration;
    } else {
      // Возобновление - обновляем стартовое время
      startTimeRef.current = Date.now() - (progress / 100) * currentStory.duration;
    }
  };

  const handleTap = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const middle = rect.width / 2;

    if (x < middle) {
      prevStory();
    } else {
      nextStory();
    }
  };

  const handleLinkClick = () => {
    if (currentStory.link) {
      window.open(currentStory.link, '_blank');
    }
  };

  if (!currentStory) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Заголовок с прогресс-барами */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex space-x-1 mb-4">
          {stories.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-white bg-opacity-30 rounded">
              <div
                className="h-full bg-white rounded transition-all duration-100"
                style={{
                  width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-white">
          <div>
            <h2 className="font-semibold">{currentStory.title}</h2>
            <p className="text-sm opacity-75">
              {new Date(currentStory.createdAt).toLocaleDateString('ru-RU')}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={togglePause}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              {isPaused ? <PlayIcon className="w-5 h-5" /> : <PauseIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div 
        className="w-full h-full relative cursor-pointer flex items-center justify-center"
        onClick={handleTap}
      >
        {currentStory.contentType === 'image' && currentStory.mediaUrl && (
          <img
            src={currentStory.mediaUrl}
            alt={currentStory.title}
            className="max-w-full max-h-full object-contain"
          />
        )}

        {currentStory.contentType === 'video' && currentStory.mediaUrl && (
          <video
            src={currentStory.mediaUrl}
            className="max-w-full max-h-full object-contain"
            autoPlay
            muted
            onEnded={nextStory}
          />
        )}

        {currentStory.contentType === 'text' && (
          <div
            className="w-full h-full flex items-center justify-center p-8 text-white"
            style={
              currentStory.background?.type === 'gradient'
                ? { background: currentStory.background.value }
                : { backgroundColor: currentStory.background?.value || '#FF6B6B' }
            }
          >
            <div className="text-center max-w-lg">
              <p className="text-2xl md:text-3xl font-bold leading-relaxed break-words">
                {currentStory.textContent}
              </p>
            </div>
          </div>
        )}

        {/* Кнопки навигации для десктопа */}
        <button
          onClick={(e) => { e.stopPropagation(); prevStory(); }}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors md:block hidden"
          disabled={currentIndex === 0}
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); nextStory(); }}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors md:block hidden"
          disabled={currentIndex === stories.length - 1}
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Кнопка ссылки */}
      {currentStory.link && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <button
            onClick={handleLinkClick}
            className="bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-opacity-90 transition-colors"
          >
            {currentStory.linkText || 'Подробнее'}
          </button>
        </div>
      )}

      {/* Подсказки для мобильных */}
      <div className="absolute bottom-4 left-4 right-4 text-white text-center text-sm opacity-50 md:hidden">
        <p>Тап влево/вправо - переключение • Свайп вниз - закрыть</p>
      </div>
    </div>,
    document.body
  );
};

export const Stories: React.FC<StoriesProps> = ({ className = '' }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [showViewer, setShowViewer] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadStories();
    loadViewedStories();
  }, []);

  const loadStories = async () => {
    try {
      setLoading(true);
      const response = await ApiService.stories.getAll();
      
      // Фильтруем только активные и не истекшие stories
      const activeStories = (response || []).filter((story: Story) => {
        const now = new Date();
        const expiresAt = new Date(story.expiresAt);
        const publishAt = story.publishAt ? new Date(story.publishAt) : new Date(story.createdAt);
        
        return story.isActive && expiresAt > now && publishAt <= now;
      });
      
      setStories(activeStories);
    } catch (error) {
      console.error('Ошибка загрузки stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadViewedStories = () => {
    const viewed = sessionStorage.getItem('viewed_stories');
    if (viewed) {
      setViewedStories(new Set(JSON.parse(viewed)));
    }
  };

  const markAsViewed = (storyId: string) => {
    const newViewed = new Set([...viewedStories, storyId]);
    setViewedStories(newViewed);
    sessionStorage.setItem('viewed_stories', JSON.stringify([...newViewed]));
  };

  const openStoryViewer = (index: number) => {
    setStartIndex(index);
    setShowViewer(true);
  };

  const closeStoryViewer = () => {
    setShowViewer(false);
    // Обновляем просмотренные после закрытия
    loadViewedStories();
  };

  if (loading) {
    return (
      <div className={`flex space-x-3 overflow-x-auto pb-2 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0">
            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  if (stories.length === 0) {
    return null;
  }

  return (
    <>
      <div className={`flex space-x-3 overflow-x-auto pb-2 ${className}`}>
        {stories.map((story, index) => {
          const isViewed = viewedStories.has(story.id);
          
          return (
            <button
              key={story.id}
              onClick={() => openStoryViewer(index)}
              className="flex-shrink-0 focus:outline-none group"
            >
              <div className="relative">
                {/* Кольцо просмотра */}
                <div className={`w-18 h-18 rounded-full p-1 ${
                  isViewed 
                    ? 'bg-gray-300' 
                    : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500'
                }`}>
                  <div className="w-16 h-16 bg-white rounded-full p-1">
                    {/* Превью контента */}
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                      {story.contentType === 'image' && story.mediaUrl && (
                        <img
                          src={story.mediaUrl}
                          alt={story.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {story.contentType === 'video' && story.mediaUrl && (
                        <video
                          src={story.mediaUrl}
                          className="w-full h-full object-cover"
                          muted
                        />
                      )}
                      {story.contentType === 'text' && (
                        <div
                          className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                          style={
                            story.background?.type === 'gradient'
                              ? { background: story.background.value }
                              : { backgroundColor: story.background?.value || '#FF6B6B' }
                          }
                        >
                          {story.title.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Индикатор нового контента */}
                {!isViewed && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              
              {/* Заголовок */}
              <p className="text-xs text-gray-600 mt-2 max-w-[70px] truncate text-center">
                {story.title}
              </p>
            </button>
          );
        })}
      </div>

      {/* Просмотрщик stories */}
      {showViewer && (
        <StoryViewer
          stories={stories}
          initialIndex={startIndex}
          onClose={closeStoryViewer}
        />
      )}
    </>
  );
};

export default Stories;
