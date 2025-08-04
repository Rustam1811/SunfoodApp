// 📱 Типы для системы Stories согласно ТЗ

export type StoryContentType = 'image' | 'video' | 'text';

export type StoryBackground = {
  type: 'color' | 'gradient';
  value: string; // hex color или CSS gradient
};

export interface Story {
  id: string;
  title: string; // до 50 символов
  contentType: StoryContentType;
  
  // Контент
  mediaUrl?: string; // для фото/видео
  textContent?: string; // для текстовых слайдов (1-3 предложения)
  background?: StoryBackground; // фон для текстовых слайдов
  
  // Настройки
  duration: number; // в миллисекундах, по умолчанию 5000
  isActive: boolean;
  link?: string; // ссылка для перехода
  linkText?: string; // текст кнопки
  
  // Статистика
  viewCount: number;
  
  // Время
  createdAt: Date;
  publishAt?: Date; // для отложенной публикации
  expiresAt: Date; // автоматически через 24 часа
  
  // Метаданные файла
  fileSize?: number; // в байтах
  originalFileName?: string;
}

export interface StoryPack {
  id: string;
  stories: Story[];
  isActive: boolean;
  createdAt: Date;
}

export interface StoryView {
  id: string;
  storyId: string;
  userId?: string;
  viewedAt: Date;
  sessionId: string; // для анонимных пользователей
}

// Ограничения файлов
export const STORY_LIMITS = {
  IMAGE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5 МБ
    FORMATS: ['image/jpeg', 'image/png', 'image/webp']
  },
  VIDEO: {
    MAX_SIZE: 30 * 1024 * 1024, // 30 МБ
    MAX_DURATION: 30, // 30 секунд
    FORMATS: ['video/mp4', 'video/webm']
  },
  TEXT: {
    MAX_LENGTH: 150, // примерно 1-3 предложения
    TITLE_MAX_LENGTH: 50
  }
};

// Фильтры для админки
export type StoryFilter = 'active' | 'archived' | 'scheduled' | 'all';

export interface StoryStats {
  totalViews: number;
  uniqueViews: number;
  completionRate: number; // процент досмотра до конца
  avgViewTime: number;
}
