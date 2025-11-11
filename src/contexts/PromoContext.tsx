import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Promo, PromoApplication } from '../../admin/types/promo';
import { getActivePromos } from '../../admin/services/promoService';
import { applyAllPromos, calculateTotalDiscount, getAllFreeProducts, getTotalBonusPoints } from '../services/promoEngine';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  categoryId?: number;
}

interface PromoContextType {
  activePromos: Promo[];
  appliedPromos: PromoApplication[];
  totalDiscount: number;
  freeProducts: Array<{ productId: number; quantity: number }>;
  bonusPoints: number;
  refreshPromos: () => Promise<void>;
  calculatePromosForCart: (cart: CartItem[]) => void;
  loading: boolean;
}

const PromoContext = createContext<PromoContextType | undefined>(undefined);

export const PromoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activePromos, setActivePromos] = useState<Promo[]>([]);
  const [appliedPromos, setAppliedPromos] = useState<PromoApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Загрузка активных акций
  const refreshPromos = async () => {
    setLoading(true);
    try {
      const promos = await getActivePromos();
      setActivePromos(promos);
    } catch (error) {
      console.error('Ошибка загрузки акций:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const loadPromos = async () => {
      setLoading(true);
      try {
        const promos = await getActivePromos();
        if (isMounted) {
          setActivePromos(promos);
        }
      } catch (error) {
        console.error('Ошибка загрузки акций:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPromos();

    return () => {
      isMounted = false;
    };
  }, []);

  // Вычисление акций для корзины
  const calculatePromosForCart = (cart: CartItem[]) => {
    if (cart.length === 0 || activePromos.length === 0) {
      setAppliedPromos([]);
      return;
    }

    const applications = applyAllPromos(activePromos, cart);
    setAppliedPromos(applications);
  };

  const totalDiscount = calculateTotalDiscount(appliedPromos);
  const freeProducts = getAllFreeProducts(appliedPromos);
  const bonusPoints = getTotalBonusPoints(appliedPromos);

  return (
    <PromoContext.Provider
      value={{
        activePromos,
        appliedPromos,
        totalDiscount,
        freeProducts,
        bonusPoints,
        refreshPromos,
        calculatePromosForCart,
        loading
      }}
    >
      {children}
    </PromoContext.Provider>
  );
};

export const usePromo = (): PromoContextType => {
  const context = useContext(PromoContext);
  if (!context) {
    throw new Error('usePromo must be used within PromoProvider');
  }
  return context;
};
