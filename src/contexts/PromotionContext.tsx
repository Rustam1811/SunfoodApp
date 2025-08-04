import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

interface Promotion {
  id: string;
  title: string;
  description: string;
  image?: string;
  imageUrl?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  category: string;
  minOrderAmount: number;
  maxUsageLimit?: number;
  usageCount: number;
  isActive: boolean;
  createdAt?: string;
  // Дополнительные поля для интеграции
  applicableCategories?: string[];
  maxDiscountAmount?: number; // максимальная сумма скидки для процентных скидок
}

interface AppliedPromotion {
  promotion: Promotion;
  discountAmount: number;
  appliedAt: Date;
}

interface PromotionContextType {
  // Состояние акций
  promotions: Promotion[];
  activePromotions: Promotion[];
  appliedPromotion: AppliedPromotion | null;
  loading: boolean;
  
  // Методы управления акциями
  applyPromotion: (promotion: Promotion, orderAmount: number, categories: string[]) => Promise<boolean>;
  removePromotion: () => void;
  calculateDiscount: (promotion: Promotion, orderAmount: number, categories: string[]) => number;
  isPromotionApplicable: (promotion: Promotion, orderAmount: number, categories: string[]) => boolean;
  
  // Утилиты
  refreshPromotions: () => Promise<void>;
  getDiscountText: (promotion: Promotion) => string;
}

const PromotionContext = createContext<PromotionContextType | null>(null);

export const usePromotion = () => {
  const context = useContext(PromotionContext);
  if (!context) {
    throw new Error('usePromotion must be used within a PromotionProvider');
  }
  return context;
};

interface PromotionProviderProps {
  children: ReactNode;
}

export const PromotionProvider: React.FC<PromotionProviderProps> = ({ children }) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [appliedPromotion, setAppliedPromotion] = useState<AppliedPromotion | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Следим за авторизацией
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user ? user.uid : null);
    });

    return () => unsubscribe();
  }, []);

  // Загружаем акции при смене пользователя
  useEffect(() => {
    if (currentUser) {
      refreshPromotions();
    }
  }, [currentUser]);

  // Восстанавливаем примененную акцию из localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('appliedPromotion');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Проверяем, что акция еще действительна
        if (new Date(parsed.promotion.endDate) > new Date()) {
          setAppliedPromotion({
            ...parsed,
            appliedAt: new Date(parsed.appliedAt)
          });
        } else {
          localStorage.removeItem('appliedPromotion');
        }
      }
    } catch (error) {
      console.error('Ошибка восстановления акции:', error);
      localStorage.removeItem('appliedPromotion');
    }
  }, []);

  // Сохраняем примененную акцию в localStorage
  useEffect(() => {
    if (appliedPromotion) {
      localStorage.setItem('appliedPromotion', JSON.stringify(appliedPromotion));
    } else {
      localStorage.removeItem('appliedPromotion');
    }
  }, [appliedPromotion]);

  const refreshPromotions = async (): Promise<void> => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const response = await fetch('https://us-central1-coffeeaddict-c9d70.cloudfunctions.net/promotions');
      if (response.ok) {
        const data = await response.json();
        setPromotions(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки акций:', error);
    } finally {
      setLoading(false);
    }
  };

  const activePromotions = promotions.filter(promotion => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    
    return promotion.isActive && 
           now >= startDate && 
           now <= endDate &&
           (!promotion.maxUsageLimit || promotion.usageCount < promotion.maxUsageLimit);
  });

  const getDiscountText = (promotion: Promotion): string => {
    if (promotion.discountType === 'percentage') {
      return `${promotion.discountValue}%`;
    } else {
      return `${promotion.discountValue}₸`;
    }
  };

  const calculateDiscount = (promotion: Promotion, orderAmount: number, categories: string[]): number => {
    if (!isPromotionApplicable(promotion, orderAmount, categories)) {
      return 0;
    }

    let discount = 0;
    
    if (promotion.discountType === 'percentage') {
      discount = (orderAmount * promotion.discountValue) / 100;
      
      // Применяем максимальную сумму скидки, если она указана
      if (promotion.maxDiscountAmount && discount > promotion.maxDiscountAmount) {
        discount = promotion.maxDiscountAmount;
      }
    } else {
      discount = promotion.discountValue;
    }

    // Скидка не может быть больше суммы заказа
    return Math.min(discount, orderAmount);
  };

  const isPromotionApplicable = (promotion: Promotion, orderAmount: number, categories: string[]): boolean => {
    // Проверяем минимальную сумму заказа
    if (promotion.minOrderAmount > 0 && orderAmount < promotion.minOrderAmount) {
      return false;
    }

    // Проверяем категории (если указаны)
    if (promotion.category && promotion.category !== 'all') {
      const hasApplicableCategory = categories.some(category => 
        category === promotion.category || 
        (promotion.applicableCategories && promotion.applicableCategories.includes(category))
      );
      
      if (!hasApplicableCategory) {
        return false;
      }
    }

    // Проверяем лимит использования
    if (promotion.maxUsageLimit && promotion.usageCount >= promotion.maxUsageLimit) {
      return false;
    }

    // Проверяем даты действия
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    
    return now >= startDate && now <= endDate && promotion.isActive;
  };

  const applyPromotion = async (promotion: Promotion, orderAmount: number, categories: string[]): Promise<boolean> => {
    try {
      if (!isPromotionApplicable(promotion, orderAmount, categories)) {
        return false;
      }

      const discountAmount = calculateDiscount(promotion, orderAmount, categories);
      
      if (discountAmount === 0) {
        return false;
      }

      const appliedPromo: AppliedPromotion = {
        promotion,
        discountAmount,
        appliedAt: new Date()
      };

      setAppliedPromotion(appliedPromo);
      return true;
    } catch (error) {
      console.error('Ошибка применения акции:', error);
      return false;
    }
  };

  const removePromotion = (): void => {
    setAppliedPromotion(null);
  };

  const contextValue: PromotionContextType = {
    promotions,
    activePromotions,
    appliedPromotion,
    loading,
    applyPromotion,
    removePromotion,
    calculateDiscount,
    isPromotionApplicable,
    refreshPromotions,
    getDiscountText
  };

  return (
    <PromotionContext.Provider value={contextValue}>
      {children}
    </PromotionContext.Provider>
  );
};
