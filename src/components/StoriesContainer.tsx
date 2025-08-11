import React, { useState, useEffect, useRef } from 'react';
import InstagramStories, { InstagramStoriesRef, StoryUser } from './InstagramStories';
import { StoriesAdapter } from '../utils/storiesAdapter';

interface StoriesContainerProps {
  className?: string;
  showName?: boolean;
  avatarSize?: number;
}

export const StoriesContainer: React.FC<StoriesContainerProps> = ({
  className = '',
  showName = true,
  avatarSize = 70
}) => {
  const [storyUsers, setStoryUsers] = useState<StoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const storiesRef = useRef<InstagramStoriesRef>(null);

  // Загрузка историй из API
  const loadStories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Попробуем загрузить из API
      const response = await fetch('http://localhost:3000/api/stories');
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          const adaptedStories = StoriesAdapter.adaptStoriesToUsers(result.data);
          setStoryUsers(adaptedStories);
        } else {
          throw new Error('Invalid API response');
        }
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.warn('Failed to load stories from API, using test data:', error);
      
      // Если API не работает, используем тестовые данные
      const testStories = StoriesAdapter.createTestStories();
      setStoryUsers(testStories);
      setError(null); // Не показываем ошибку пользователю для тестовых данных
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  // Обработчики событий
  const handleStoryShow = (userId: string) => {
    console.log('Story shown for user:', userId);
  };

  const handleStoryHide = (userId: string) => {
    console.log('Story hidden for user:', userId);
  };

  const handleStoryStart = (userId?: string, storyId?: string) => {
    console.log('Story started:', { userId, storyId });
    
    // Здесь можно отправить аналитику о просмотре
    if (userId && storyId) {
      // Отправка статистики просмотра
      fetch('http://localhost:3000/api/stories/view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyId,
          userId,
          viewedAt: new Date().toISOString()
        })
      }).catch(console.error);
    }
  };

  const handleStoryEnd = (userId?: string, storyId?: string) => {
    console.log('Story ended:', { userId, storyId });
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="flex space-x-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="animate-pulse rounded-full bg-gray-200"
              style={{ width: avatarSize, height: avatarSize }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">
            Не удалось загрузить истории: {error}
          </p>
          <button
            onClick={loadStories}
            className="mt-2 text-red-700 hover:text-red-800 text-sm font-medium"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (storyUsers.length === 0) {
    return (
      <div className={`p-4 ${className}`}>
        <p className="text-gray-500 text-center text-sm">
          Пока нет активных историй
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <InstagramStories
        ref={storiesRef}
        stories={storyUsers}
        avatarSize={avatarSize}
        showName={showName}
        onShow={handleStoryShow}
        onHide={handleStoryHide}
        onStoryStart={handleStoryStart}
        onStoryEnd={handleStoryEnd}
      />
    </div>
  );
};

// Экспортируем также методы для внешнего использования
export default StoriesContainer;
