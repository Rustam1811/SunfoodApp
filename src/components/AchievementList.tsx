import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrophyIcon, StarIcon, CheckIcon } from '@heroicons/react/24/solid';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: {
    type: 'orders_count' | 'total_spent' | 'items_ordered' | 'login_streak';
    value: number;
  } | string; // Поддерживаем строковый формат для обратной совместимости
  reward: {
    type: 'points' | 'discount';
    value: number;
  } | number; // Поддерживаем числовой формат для обратной совместимости
  icon?: string;
  isActive: boolean;
  createdAt: any;
}

interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: any;
  claimed: boolean;
}

interface AchievementListProps {
  className?: string;
}

export const AchievementList: React.FC<AchievementListProps> = ({ className = '' }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user?.uid || null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Загружаем все достижения независимо от авторизации
    loadAchievements();
    
    if (currentUser) {
      loadUserAchievements();
      loadUserProgress();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const loadAchievements = async () => {
    try {
      const apiUrl = 'https://us-central1-coffeeaddict-c9d70.cloudfunctions.net/achievements';
      
      const response = await fetch(apiUrl, { mode: 'cors' });
      if (response.ok) {
        const data = await response.json();
        console.log('Загруженные достижения:', data); // Для отладки
        
        // API возвращает объект с полем 'value', содержащим массив
        const achievementsArray = data.value || data.achievements || data || [];
        
        // Преобразуем данные в нужный формат
        const formattedAchievements = achievementsArray.map((achievement: any) => ({
          ...achievement,
          condition: typeof achievement.condition === 'string' 
            ? { type: 'orders_count', value: 1 } // дефолтное условие
            : achievement.condition,
          reward: typeof achievement.reward === 'number'
            ? { type: 'points', value: achievement.reward }
            : achievement.reward
        }));
        
        console.log('Отформатированные достижения:', formattedAchievements); // Для отладки
        setAchievements(formattedAchievements);
      }
    } catch (error) {
      console.error('Ошибка загрузки достижений:', error);
    }
  };

  const loadUserAchievements = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch(`https://us-central1-coffeeaddict-c9d70.cloudfunctions.net/achievements/${currentUser}`);
      if (response.ok) {
        const data = await response.json();
        setUserAchievements(data.userAchievements || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки пользовательских достижений:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProgress = async () => {
    if (!currentUser) return;

    try {
      // Получаем статистику пользователя для расчета прогресса
      const bonusResponse = await fetch(`https://us-central1-coffeeaddict-c9d70.cloudfunctions.net/userBonus?userId=${currentUser}`);
      if (bonusResponse.ok) {
        const bonusData = await bonusResponse.json();
        
        // Примерный расчет прогресса (можно расширить)
        setUserProgress({
          orders_count: bonusData.ordersCount || 0,
          total_spent: bonusData.totalSpent || 0,
          items_ordered: bonusData.itemsOrdered || 0,
          login_streak: bonusData.loginStreak || 0
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки прогресса пользователя:', error);
    }
  };

  const claimAchievement = async (achievementId: string) => {
    if (!currentUser) return;

    try {
      const response = await fetch(`https://us-central1-coffeeaddict-c9d70.cloudfunctions.net/achievements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser,
          achievementId,
          action: 'claim'
        }),
      });

      if (response.ok) {
        await loadUserAchievements();
      }
    } catch (error) {
      console.error('Ошибка при получении награды:', error);
    }
  };

  const getAchievementStatus = (achievement: Achievement) => {
    const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
    
    // Безопасно получаем условие достижения
    let conditionType = 'orders_count';
    let conditionValue = 1;
    
    if (typeof achievement.condition === 'object' && achievement.condition !== null) {
      conditionType = achievement.condition.type || 'orders_count';
      conditionValue = achievement.condition.value || 1;
    }
    
    const progress = userProgress[conditionType] || 0;
    const required = conditionValue;

    if (userAchievement?.claimed) {
      return { status: 'claimed', progress: 100 };
    } else if (userAchievement && !userAchievement.claimed) {
      return { status: 'unlocked', progress: 100 };
    } else if (progress >= required) {
      return { status: 'completed', progress: 100 };
    } else {
      return { status: 'in_progress', progress: Math.min((progress / required) * 100, 100) };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'orders':
        return '🛒';
      case 'loyalty':
        return '❤️';
      case 'social':
        return '👥';
      case 'special':
        return '⭐';
      default:
        return '🏆';
    }
  };

  const getRewardText = (reward: Achievement['reward']) => {
    // Поддерживаем как новый формат (объект), так и старый (число)
    if (typeof reward === 'number') {
      return `+${reward} бонусов`;
    }
    
    if (reward && typeof reward === 'object') {
      if (reward.type === 'points') {
        return `+${reward.value} бонусов`;
      } else {
        return `${reward.value}% скидка`;
      }
    }
    
    return 'Награда';
  };

  if (loading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-200 rounded-lg h-20"></div>
          ))}
        </div>
      </div>
    );
  }

  const activeAchievements = achievements.filter(a => a.isActive);

  return (
    <div className={`${className} space-y-4`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Достижения</h2>
        <TrophyIcon className="w-6 h-6 text-yellow-500" />
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {activeAchievements.map((achievement) => {
            const { status, progress } = getAchievementStatus(achievement);

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  status === 'claimed' 
                    ? 'bg-green-50 border-green-200' 
                    : status === 'unlocked' 
                    ? 'bg-yellow-50 border-yellow-200 shadow-lg' 
                    : status === 'completed'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      status === 'claimed' ? 'bg-green-100' : 
                      status === 'unlocked' ? 'bg-yellow-100' : 
                      'bg-gray-100'
                    }`}>
                      {achievement.icon || getCategoryIcon(achievement.category)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {achievement.title}
                      </h3>
                      {status === 'claimed' && (
                        <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {achievement.description}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-blue-600">
                        {getRewardText(achievement.reward)}
                      </span>
                      
                      {status !== 'claimed' && (
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${
                                status === 'completed' ? 'bg-blue-500' : 'bg-gray-400'
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {Math.round(progress)}%
                          </span>
                        </div>
                      )}
                    </div>

                    {status === 'unlocked' && (
                      <motion.button
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => claimAchievement(achievement.id)}
                        className="mt-3 w-full bg-yellow-500 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors"
                      >
                        Получить награду!
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {activeAchievements.length === 0 && (
        <div className="text-center py-8">
          <TrophyIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">Достижения скоро появятся!</p>
        </div>
      )}
    </div>
  );
};
