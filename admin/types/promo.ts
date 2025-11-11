/**
 * Типы акций и промо-предложений
 */

export interface PromoCondition {
  /** Тип условия */
  type: 
    | 'time_range'        // Временной диапазон (например, с 8:00 до 12:00)
    | 'product_quantity'  // Количество определенного товара
    | 'min_cart_value'    // Минимальная сумма корзины
    | 'specific_product'  // Конкретный товар
    | 'day_of_week'       // День недели
    | 'category';         // Категория товара

  /** Значение условия (зависит от типа) */
  value: any;
  
  /** ID товара (для product_quantity, specific_product) */
  productId?: number;
  
  /** ID категории (для category) */
  categoryId?: number;
  
  /** Временной диапазон (для time_range) */
  timeRange?: {
    start: string; // "08:00"
    end: string;   // "12:00"
  };
  
  /** Дни недели (для day_of_week) - 0-6 где 0 = воскресенье */
  daysOfWeek?: number[];
  
  /** Минимальное количество (для product_quantity) */
  minQuantity?: number;
  
  /** Минимальная сумма (для min_cart_value) */
  minValue?: number;
}

export interface PromoReward {
  /** Тип награды */
  type: 
    | 'percentage_discount'  // Процентная скидка
    | 'fixed_discount'       // Фиксированная скидка
    | 'free_product'         // Бесплатный товар
    | 'buy_x_get_y'          // Купи X получи Y
    | 'bonus_points';        // Бонусные баллы

  /** Значение награды */
  value: number;
  
  /** ID бесплатного товара (для free_product) */
  freeProductId?: number;
  
  /** Применяется ко всей корзине или конкретному товару */
  applyTo?: 'cart' | 'product' | 'category';
  
  /** ID товара для применения (для applyTo='product') */
  targetProductId?: number;
  
  /** ID категории для применения (для applyTo='category') */
  targetCategoryId?: number;

  /** Настройки для buy_x_get_y */
  buyXGetY?: {
    buyQuantity: number;    // Купи X
    getQuantity: number;    // Получи Y
    productId?: number;     // ID товара (если специфичный)
  };
}

export interface Promo {
  id: string;
  
  /** Название акции */
  title: string;
  
  /** Описание акции */
  description: string;
  
  /** Условия акции */
  conditions: PromoCondition[];
  
  /** Награды акции */
  rewards: PromoReward[];
  
  /** Активна ли акция */
  isActive: boolean;
  
  /** Дата начала */
  startDate: Date | string;
  
  /** Дата окончания */
  endDate: Date | string;
  
  /** Приоритет (чем выше, тем раньше применяется) */
  priority: number;
  
  /** Можно ли комбинировать с другими акциями */
  stackable: boolean;
  
  /** Количество использований (для статистики) */
  usageCount?: number;
  
  /** Создано */
  createdAt: Date | string;
  
  /** Обновлено */
  updatedAt: Date | string;
  
  /** Создатель */
  createdBy?: string;
  
  /** Отображать ли на главной */
  showOnHome?: boolean;
  
  /** Изображение акции */
  imageUrl?: string;
  
  /** Короткий текст для бейджа */
  badge?: string;
}

/**
 * Результат применения акции
 */
export interface PromoApplication {
  /** ID акции */
  promoId: string;
  
  /** Название акции */
  promoTitle: string;
  
  /** Сумма скидки */
  discountAmount: number;
  
  /** Бесплатные товары */
  freeProducts?: Array<{
    productId: number;
    quantity: number;
  }>;
  
  /** Бонусные баллы */
  bonusPoints?: number;
  
  /** Описание применения */
  description: string;
}
