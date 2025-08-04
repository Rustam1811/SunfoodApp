import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MegaphoneIcon, TagIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { ApiService } from '../services/apiConfig';

interface Promotion {
  id: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  category?: string;
  minOrderAmount?: number;
  startDate: any;
  endDate: any;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  imageUrl?: string;
  image?: string;
  createdAt: any;
}

interface PromotionBannerProps {
  className?: string;
  showAll?: boolean;
  maxItems?: number;
}

// Функция для форматирования скидки (вынесена наружу)
const getDiscountText = (promotion: Promotion) => {
  if (!promotion.discountType || promotion.discountValue === undefined) {
    return '0%';
  }
  
  if (promotion.discountType === 'percentage') {
    return `${promotion.discountValue}%`;
  } else {
    return `${promotion.discountValue}₽`;
  }
};

export const PromotionBanner: React.FC<PromotionBannerProps> = ({ 
  className = '', 
  showAll = false, 
  maxItems = 3 
}) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user?.uid || null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      const data = await ApiService.promotions.getAll();
      const activePromotions = (data.promotions || []).filter((promo: Promotion) => {
        const now = new Date();
        const startDate = new Date(promo.startDate);
        const endDate = new Date(promo.endDate);
        
        return promo.isActive && 
               now >= startDate && 
               now <= endDate &&
               (!promo.usageLimit || promo.usedCount < promo.usageLimit);
      });
      
      setPromotions(activePromotions);
    } catch (error) {
      console.error('Ошибка загрузки акций:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getDaysLeft = (endDate: any) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getPromotionGradient = (index: number) => {
    const gradients = [
      'from-red-500 to-pink-500',
      'from-blue-500 to-purple-500',
      'from-green-500 to-teal-500',
      'from-yellow-500 to-orange-500',
      'from-purple-500 to-indigo-500'
    ];
    return gradients[index % gradients.length];
  };

  if (loading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  const displayPromotions = showAll ? promotions : promotions.slice(0, maxItems);

  if (displayPromotions.length === 0) {
    return null;
  }

  return (
    <div className={`${className} space-y-3`}>
      <div className="flex items-center space-x-2">
        <MegaphoneIcon className="w-5 h-5 text-red-500" />
        <h2 className="text-lg font-bold text-gray-900">Акции</h2>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {displayPromotions.map((promotion, index) => {
            const daysLeft = getDaysLeft(promotion.endDate);
            
            return (
              <motion.div
                key={promotion.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${getPromotionGradient(index)} p-4 text-white shadow-lg`}
              >
                {/* Фоновый паттерн */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white"></div>
                  <div className="absolute -bottom-2 -left-2 w-12 h-12 rounded-full bg-white"></div>
                </div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <TagIcon className="w-4 h-4" />
                        <span className="text-sm font-semibold opacity-90">
                          СКИДКА {getDiscountText(promotion)}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold mb-1 line-clamp-1">
                        {promotion.title}
                      </h3>
                      
                      <p className="text-sm opacity-90 line-clamp-2 mb-2">
                        {promotion.description}
                      </p>

                      <div className="flex items-center space-x-4 text-xs">
                        {promotion.minOrderAmount && (
                          <div className="flex items-center space-x-1">
                            <span>От {promotion.minOrderAmount}₽</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-3 h-3" />
                          <span>до {formatDate(promotion.endDate)}</span>
                        </div>

                        {daysLeft <= 3 && (
                          <div className="flex items-center space-x-1 bg-white bg-opacity-20 px-2 py-1 rounded-full">
                            <ClockIcon className="w-3 h-3" />
                            <span className="font-semibold">
                              {daysLeft === 0 ? 'Последний день!' : `${daysLeft} дн.`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 ml-4">
                      <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold">
                          {getDiscountText(promotion)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {promotion.usageLimit && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Использовано</span>
                        <span>{promotion.usedCount}/{promotion.usageLimit}</span>
                      </div>
                      <div className="w-full h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-white rounded-full"
                          initial={{ width: 0 }}
                          animate={{ 
                            width: `${Math.min((promotion.usedCount / promotion.usageLimit) * 100, 100)}%` 
                          }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {!showAll && promotions.length > maxItems && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-full text-center py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
        >
          Показать все акции ({promotions.length})
        </motion.button>
      )}
    </div>
  );
};

export const PromotionModal: React.FC<{
  promotion: Promotion;
  isOpen: boolean;
  onClose: () => void;
}> = ({ promotion, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {(promotion.imageUrl || promotion.image) && (
            <img 
              src={promotion.imageUrl || promotion.image} 
              alt={promotion.title}
              className="w-full h-48 object-cover rounded-t-xl"
            />
          )}
          
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {promotion.title}
            </h2>
            
            <p className="text-gray-600 mb-4">
              {promotion.description}
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Скидка:</span>
                <span className="text-lg font-bold text-green-600">
                  {getDiscountText(promotion.discount)}
                </span>
              </div>

              {promotion.minOrderAmount && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Минимальная сумма:</span>
                  <span className="font-semibold">{promotion.minOrderAmount}₽</span>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Действует до:</span>
                <span className="font-semibold">
                  {new Date(promotion.endDate).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-6 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Понятно
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
