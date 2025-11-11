/**
 * Движок для вычисления и применения акций
 */

import { Promo, PromoCondition, PromoReward, PromoApplication } from '../../admin/types/promo';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  categoryId?: number;
}

/**
 * Проверить, соответствует ли корзина условиям акции
 */
export function checkPromoConditions(
  promo: Promo, 
  cart: CartItem[], 
  currentTime: Date = new Date()
): boolean {
  // Проверяем каждое условие
  for (const condition of promo.conditions) {
    if (!checkSingleCondition(condition, cart, currentTime)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Проверить одно условие
 */
function checkSingleCondition(
  condition: PromoCondition, 
  cart: CartItem[], 
  currentTime: Date
): boolean {
  switch (condition.type) {
    case 'time_range':
      return checkTimeRange(condition, currentTime);
      
    case 'product_quantity':
      return checkProductQuantity(condition, cart);
      
    case 'min_cart_value':
      return checkMinCartValue(condition, cart);
      
    case 'specific_product':
      return checkSpecificProduct(condition, cart);
      
    case 'day_of_week':
      return checkDayOfWeek(condition, currentTime);
      
    case 'category':
      return checkCategory(condition, cart);
      
    default:
      return false;
  }
}

/**
 * Проверить временной диапазон
 */
function checkTimeRange(condition: PromoCondition, currentTime: Date): boolean {
  if (!condition.timeRange) return false;
  
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;
  
  const [startHour, startMinute] = condition.timeRange.start.split(':').map(Number);
  const [endHour, endMinute] = condition.timeRange.end.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  return currentTimeMinutes >= startMinutes && currentTimeMinutes <= endMinutes;
}

/**
 * Проверить количество конкретного товара
 */
function checkProductQuantity(condition: PromoCondition, cart: CartItem[]): boolean {
  if (!condition.productId || !condition.minQuantity) return false;
  
  const item = cart.find(i => i.id === condition.productId);
  return item ? item.quantity >= condition.minQuantity : false;
}

/**
 * Проверить минимальную сумму корзины
 */
function checkMinCartValue(condition: PromoCondition, cart: CartItem[]): boolean {
  if (!condition.minValue) return false;
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return total >= condition.minValue;
}

/**
 * Проверить наличие конкретного товара
 */
function checkSpecificProduct(condition: PromoCondition, cart: CartItem[]): boolean {
  if (!condition.productId) return false;
  
  return cart.some(item => item.id === condition.productId);
}

/**
 * Проверить день недели
 */
function checkDayOfWeek(condition: PromoCondition, currentTime: Date): boolean {
  if (!condition.daysOfWeek || condition.daysOfWeek.length === 0) return false;
  
  const currentDay = currentTime.getDay();
  return condition.daysOfWeek.includes(currentDay);
}

/**
 * Проверить категорию товара
 */
function checkCategory(condition: PromoCondition, cart: CartItem[]): boolean {
  if (!condition.categoryId) return false;
  
  return cart.some(item => item.categoryId === condition.categoryId);
}

/**
 * Применить акцию и вычислить награду
 */
export function applyPromo(
  promo: Promo, 
  cart: CartItem[]
): PromoApplication | null {
  if (!checkPromoConditions(promo, cart)) {
    return null;
  }
  
  const application: PromoApplication = {
    promoId: promo.id,
    promoTitle: promo.title,
    discountAmount: 0,
    description: promo.description
  };
  
  // Применяем каждую награду
  for (const reward of promo.rewards) {
    applyReward(reward, cart, application);
  }
  
  return application;
}

/**
 * Применить одну награду
 */
function applyReward(
  reward: PromoReward, 
  cart: CartItem[], 
  application: PromoApplication
): void {
  switch (reward.type) {
    case 'percentage_discount':
      applyPercentageDiscount(reward, cart, application);
      break;
      
    case 'fixed_discount':
      applyFixedDiscount(reward, application);
      break;
      
    case 'free_product':
      applyFreeProduct(reward, application);
      break;
      
    case 'buy_x_get_y':
      applyBuyXGetY(reward, cart, application);
      break;
      
    case 'bonus_points':
      applyBonusPoints(reward, application);
      break;
  }
}

/**
 * Применить процентную скидку
 */
function applyPercentageDiscount(
  reward: PromoReward, 
  cart: CartItem[], 
  application: PromoApplication
): void {
  let discountBase = 0;
  
  if (reward.applyTo === 'cart') {
    // Скидка на всю корзину
    discountBase = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  } else if (reward.applyTo === 'product' && reward.targetProductId) {
    // Скидка на конкретный товар
    const item = cart.find(i => i.id === reward.targetProductId);
    if (item) {
      discountBase = item.price * item.quantity;
    }
  } else if (reward.applyTo === 'category' && reward.targetCategoryId) {
    // Скидка на категорию
    discountBase = cart
      .filter(item => item.categoryId === reward.targetCategoryId)
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
  
  application.discountAmount += Math.round(discountBase * (reward.value / 100));
}

/**
 * Применить фиксированную скидку
 */
function applyFixedDiscount(reward: PromoReward, application: PromoApplication): void {
  application.discountAmount += reward.value;
}

/**
 * Применить бесплатный товар
 */
function applyFreeProduct(reward: PromoReward, application: PromoApplication): void {
  if (!reward.freeProductId) return;
  
  if (!application.freeProducts) {
    application.freeProducts = [];
  }
  
  application.freeProducts.push({
    productId: reward.freeProductId,
    quantity: 1
  });
}

/**
 * Применить "Купи X получи Y"
 */
function applyBuyXGetY(
  reward: PromoReward, 
  cart: CartItem[], 
  application: PromoApplication
): void {
  if (!reward.buyXGetY) return;
  
  const { buyQuantity, getQuantity, productId } = reward.buyXGetY;
  
  if (productId) {
    // Для конкретного товара
    const item = cart.find(i => i.id === productId);
    if (item && item.quantity >= buyQuantity) {
      const freeCount = Math.floor(item.quantity / buyQuantity) * getQuantity;
      
      if (!application.freeProducts) {
        application.freeProducts = [];
      }
      
      application.freeProducts.push({
        productId,
        quantity: freeCount
      });
      
      application.discountAmount += item.price * freeCount;
    }
  }
}

/**
 * Применить бонусные баллы
 */
function applyBonusPoints(reward: PromoReward, application: PromoApplication): void {
  application.bonusPoints = (application.bonusPoints || 0) + reward.value;
}

/**
 * Применить все подходящие акции к корзине
 */
export function applyAllPromos(
  promos: Promo[], 
  cart: CartItem[]
): PromoApplication[] {
  const applications: PromoApplication[] = [];
  
  // Сортируем по приоритету
  const sortedPromos = [...promos].sort((a, b) => b.priority - a.priority);
  
  for (const promo of sortedPromos) {
    const application = applyPromo(promo, cart);
    
    if (application) {
      applications.push(application);
      
      // Если акция не stackable, прекращаем применение других
      if (!promo.stackable) {
        break;
      }
    }
  }
  
  return applications;
}

/**
 * Вычислить итоговую скидку
 */
export function calculateTotalDiscount(applications: PromoApplication[]): number {
  return applications.reduce((total, app) => total + app.discountAmount, 0);
}

/**
 * Получить все бесплатные товары
 */
export function getAllFreeProducts(applications: PromoApplication[]): Array<{ productId: number; quantity: number }> {
  const allFreeProducts: Array<{ productId: number; quantity: number }> = [];
  
  for (const app of applications) {
    if (app.freeProducts) {
      for (const freeProduct of app.freeProducts) {
        const existing = allFreeProducts.find(p => p.productId === freeProduct.productId);
        if (existing) {
          existing.quantity += freeProduct.quantity;
        } else {
          allFreeProducts.push({ ...freeProduct });
        }
      }
    }
  }
  
  return allFreeProducts;
}

/**
 * Получить общие бонусные баллы
 */
export function getTotalBonusPoints(applications: PromoApplication[]): number {
  return applications.reduce((total, app) => total + (app.bonusPoints || 0), 0);
}
