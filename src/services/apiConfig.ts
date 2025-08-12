// 🔧 Конфигурация API endpoints для продакшена
export const API_CONFIG = {
  // Firebase Functions URLs (продакшн)
  FIREBASE_BASE_URL: 'https://us-central1-coffeeaddict-c9d70.cloudfunctions.net',
  
  // Local development URLs
  LOCAL_BASE_URL: 'http://localhost:3000/api',
  
  // Определяем, какие URL использовать
  get BASE_URL() {
    // Если в проде - используем Firebase Functions
    if (import.meta.env.PROD || window.location.hostname !== 'localhost') {
      return this.FIREBASE_BASE_URL;
    }
    // В разработке - локальный сервер
    return this.LOCAL_BASE_URL;
  },
  
  // API endpoints
  get ENDPOINTS() {
    return {
      STORIES: `${this.BASE_URL}/stories`,
      PROMOTIONS: `${this.BASE_URL}/promotions`,
      BONUS_SETTINGS: `${this.BASE_URL}/bonusSettings`,
      USER_BONUS: `${this.BASE_URL}/userBonus`,
      USE_BONUS: `${this.BASE_URL}/useBonus`,
      ORDERS: `${this.BASE_URL}/orders`,
      PROMO_CODES: `${this.BASE_URL}/promoCodes`,
    };
  }
};

// 🎯 Утилита для API вызовов
export class ApiService {
  static async request(endpoint: string, options: RequestInit = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_CONFIG.BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Error for ${url}:`, error);
      throw error;
    }
  }

  // Stories API
  static stories = {
    getAll: () => ApiService.request('/stories'),
    
    create: (data: {
      title: string;
      contentType: 'image' | 'video' | 'text';
      mediaUrl?: string;
      textContent?: string;
      background?: { type: 'color' | 'gradient'; value: string };
      duration?: number;
      link?: string;
      linkText?: string;
      publishAt?: string;
      fileSize?: number;
      originalFileName?: string;
    }) => ApiService.request('/stories', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
    
    update: (id: string, data: Record<string, unknown>) => ApiService.request(`/stories/${id}`, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
    
    delete: (id: string) => ApiService.request(`/stories/${id}`, { 
      method: 'DELETE' 
    }),
    
    recordView: (id: string, userId?: string) => {
      const sessionId = sessionStorage.getItem('story_session_id') || 
        `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      if (!sessionStorage.getItem('story_session_id')) {
        sessionStorage.setItem('story_session_id', sessionId);
      }

      return ApiService.request(`/stories/${id}/view`, { 
        method: 'POST',
        body: JSON.stringify({ userId, sessionId })
      });
    },
    
    getStats: (id: string) => ApiService.request(`/stories/${id}/stats`),
    
    clone: (id: string) => ApiService.request(`/stories/${id}/clone`, { 
      method: 'POST' 
    }),
  };

  // Promotions API
  static promotions = {
    getAll: () => ApiService.request('/promotions'),
    create: (data: PromotionsCreateData) => ApiService.request('/promotions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: PromotionsCreateData) => ApiService.request(`/promotions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => ApiService.request(`/promotions/${id}`, { method: 'DELETE' }),
    use: (id: string) => ApiService.request(`/promotions/${id}/use`, { method: 'POST' }),
  };
}

// Тип данных для создания/обновления акции
export interface PromotionsCreateData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  [key: string]: unknown; // Для дополнительных полей, если есть
}

// 🎯 Хук для проверки окружения
export const useEnvironment = () => {
  const isDev = import.meta.env.DEV;
  const isProd = import.meta.env.PROD;
  const isLocal = window.location.hostname === 'localhost';
  
  return {
    isDev,
    isProd,
    isLocal,
    apiBaseUrl: API_CONFIG.BASE_URL,
    usingFirebase: !isLocal || isProd,
  };
};
