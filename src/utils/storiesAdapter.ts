import { Story } from '../types/story';
import { StoryUser } from '../components/InstagramStories';

// Адаптер для преобразования наших Story в формат StoryUser для Instagram Stories
export class StoriesAdapter {
  /**
   * Преобразует массив Story в массив StoryUser для Instagram Stories компонента
   * Группирует истории по создателю (для демо используем одного пользователя)
   */
  static adaptStoriesToUsers(stories: Story[]): StoryUser[] {
    // Фильтруем только активные истории, которые не истекли
    const activeStories = stories.filter(story => {
      const now = new Date();
      const expiresAt = new Date(story.expiresAt);
      return story.isActive && expiresAt > now;
    });

    if (activeStories.length === 0) {
      return [];
    }

    // Для демо создаем одного пользователя со всеми историями
    // В реальном приложении здесь была бы группировка по userId
    const storyUser: StoryUser = {
      id: 'sunfood_official',
      name: 'SunFood',
      avatarSource: '/images/sunfood-avatar.jpg', // Добавьте аватар в public/images
      stories: activeStories
    };

    return [storyUser];
  }

  /**
   * Создает тестовые данные в формате StoryUser
   */
  static createTestStories(): StoryUser[] {
    return [
      {
        id: 'sunfood_official',
        name: 'SunFood',
        avatarSource: '/coffeeaddict.jpg',
        stories: [
          {
            id: 'story1',
            title: 'Новое меню!',
            contentType: 'text',
            textContent: 'Попробуйте наши новые летние напитки с освежающими фруктами!',
            background: {
              type: 'gradient',
              value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            },
            duration: 5000,
            isActive: true,
            viewCount: 0,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            link: '/menu',
            linkText: 'Посмотреть меню'
          },
          {
            id: 'story2',
            title: 'Кофе дня',
            contentType: 'image',
            mediaUrl: '/coffeeaddict.jpg',
            duration: 4000,
            isActive: true,
            viewCount: 0,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            link: '/order',
            linkText: 'Заказать'
          },
          {
            id: 'story3',
            title: 'Акция дня',
            contentType: 'text',
            textContent: 'Скидка 20% на все кофейные напитки до 18:00!',
            background: {
              type: 'color',
              value: '#FF6B6B'
            },
            duration: 6000,
            isActive: true,
            viewCount: 0,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            link: '/promotions',
            linkText: 'Заказать со скидкой'
          }
        ]
      },
      {
        id: 'customer_review',
        name: 'Отзывы',
        avatarSource: '/favicon.png',
        stories: [
          {
            id: 'review1',
            title: 'Отзыв клиента',
            contentType: 'text',
            textContent: '"Лучший кофе в городе! Спасибо команде SunFood за качественный сервис!"',
            background: {
              type: 'gradient',
              value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
            },
            duration: 5000,
            isActive: true,
            viewCount: 0,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
          }
        ]
      }
    ];
  }

  /**
   * Преобразует один Story в формат совместимый с StoryUser.stories
   */
  static adaptSingleStory(story: Story): Story {
    return {
      ...story,
      // Убеждаемся что все необходимые поля присутствуют
      duration: story.duration || 5000,
      viewCount: story.viewCount || 0
    };
  }

  /**
   * Проверяет, активна ли история (не истекла и включена)
   */
  static isStoryActive(story: Story): boolean {
    const now = new Date();
    const expiresAt = new Date(story.expiresAt);
    return story.isActive && expiresAt > now;
  }

  /**
   * Фильтрует истории по статусу
   */
  static filterActiveStories(stories: Story[]): Story[] {
    return stories.filter(this.isStoryActive);
  }

  /**
   * Подсчитывает количество непросмотренных историй для пользователя
   */
  static getUnseenStoriesCount(stories: Story[], seenStoryIds: string[] = []): number {
    return stories.filter(story => 
      this.isStoryActive(story) && !seenStoryIds.includes(story.id)
    ).length;
  }
}
