# 📸 Instagram Stories для SunFood App

## Обзор

Мы успешно интегрировали компонент Instagram Stories в веб-приложение SunFood, используя концепции из пакета `@birdwingo/react-native-instagram-stories` и адаптировав их для веб-платформы.

## 🌟 Возможности

- ✅ **Аватары с градиентным кольцом** - указывают на непросмотренные истории
- ✅ **Полноэкранный просмотр** - модальное окно с историями
- ✅ **Прогресс-бары** - показывают прогресс просмотра каждой истории
- ✅ **Навигация жестами** - клики по левой/правой части экрана
- ✅ **Пауза при удержании** - длительное нажатие ставит историю на паузу
- ✅ **Поддержка разных типов контента**:
  - Изображения
  - Видео
  - Текстовые слайды с настраиваемым фоном
- ✅ **Ссылки действий** - кнопки для перехода на страницы
- ✅ **Автоматическое истечение** - истории исчезают через 24 часа
- ✅ **Интеграция с API** - загрузка историй с сервера
- ✅ **Fallback на тестовые данные** - если API недоступен

## 📂 Структура компонентов

### `InstagramStories.tsx`
Основной компонент, реализующий функциональность Instagram Stories:
- Управление состоянием просмотра
- Прогресс-бары и таймеры
- Навигация между историями
- Поддержка разных типов контента

### `StoriesContainer.tsx`
Контейнер для интеграции с API и управления данными:
- Загрузка историй из API
- Обработка ошибок и fallback
- Адаптация данных под формат компонента

### `storiesAdapter.ts`
Утилиты для преобразования данных:
- Конвертация Story в StoryUser формат
- Создание тестовых данных
- Фильтрация активных историй

## 🎯 Использование

### В главном приложении
```tsx
import { StoriesContainer } from '../components/StoriesContainer';

// В JSX
<StoriesContainer 
  className="mb-6" 
  showName={true} 
  avatarSize={70} 
/>
```

### Прямое использование Instagram Stories
```tsx
import InstagramStories, { StoryUser } from '../components/InstagramStories';

const stories: StoryUser[] = [
  {
    id: 'user1',
    name: 'SunFood',
    avatarSource: '/avatar.jpg',
    stories: [
      {
        id: 'story1',
        title: 'Новое меню',
        contentType: 'text',
        textContent: 'Попробуйте наши новые летние напитки!',
        background: { type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        duration: 5000
      }
    ]
  }
];

<InstagramStories
  stories={stories}
  avatarSize={70}
  showName={true}
  onStoryStart={(userId, storyId) => console.log('Started:', userId, storyId)}
  onStoryEnd={(userId, storyId) => console.log('Ended:', userId, storyId)}
/>
```

## 📊 API Integration

### Endpoint структура
```javascript
// GET /api/stories
{
  "success": true,
  "data": [
    {
      "id": "story1",
      "title": "Новое меню",
      "contentType": "text|image|video",
      "mediaUrl": "url_to_media",
      "textContent": "Текст для текстовых историй",
      "background": {
        "type": "color|gradient",
        "value": "#FF6B6B"
      },
      "duration": 5000,
      "isActive": true,
      "expiresAt": "2025-08-08T15:41:13.000Z",
      "link": "/menu",
      "linkText": "Посмотреть меню"
    }
  ]
}
```

### Аналитика просмотров
```javascript
// POST /api/stories/view
{
  "storyId": "story1",
  "userId": "user1",
  "viewedAt": "2025-08-07T15:41:13.000Z"
}
```

## 🎨 Кастомизация

### Доступные props для InstagramStories:
- `avatarSize` - размер аватаров (по умолчанию: 60)
- `storyAvatarSize` - размер аватара в заголовке (по умолчанию: 25)
- `animationDuration` - длительность по умолчанию (по умолчанию: 5000мс)
- `backgroundColor` - фон модального окна (по умолчанию: '#000000')
- `showName` - показывать имена под аватарами (по умолчанию: false)
- `closeIconColor` - цвет кнопки закрытия (по умолчанию: '#FFFFFF')
- `progressColor` - цвет неактивного прогресс-бара (по умолчанию: '#00000099')
- `progressActiveColor` - цвет активного прогресс-бара (по умолчанию: '#FFFFFF')

### Публичные методы через ref:
- `setStories(stories)` - обновить истории
- `show(userId?)` - показать истории (опционально для конкретного пользователя)
- `hide()` - скрыть истории
- `pause()` - поставить на паузу
- `resume()` - возобновить воспроизведение
- `isPaused()` - проверить состояние паузы
- `goToPreviousStory()` - предыдущая история
- `goToNextStory()` - следующая история

## 🔧 Настройка администратора

Истории создаются и управляются через админ-панель:
- `http://localhost:5174/admin.html` - доступ к админке
- Раздел "Story Management" для создания и редактирования историй
- Поддержка загрузки медиафайлов
- Настройка времени публикации и истечения

## 🧪 Тестирование

1. **Тестовая страница**: `http://localhost:5174/test-instagram-stories.html`
2. **Главная страница**: `http://localhost:5174/home` - интегрированные истории
3. **Админка**: `http://localhost:5174/admin.html` - управление историями

## 📱 Мобильная совместимость

Компонент адаптивен и работает на:
- ✅ Десктоп (навигация мышью + клавиатура)
- ✅ Мобильные устройства (touch события)
- ✅ Планшеты (поддержка обеих парадигм)

## 🚀 Производительность

- Ленивая загрузка медиа-контента
- Оптимизированные анимации через CSS transforms
- Минимальные re-renders через React.useCallback
- Автоматическая очистка таймеров

## 📈 Аналитика

Компонент автоматически отправляет события:
- Начало просмотра истории
- Завершение просмотра истории
- Показ/скрытие модального окна

Это позволяет отслеживать engagement и эффективность контента.

---

## 🎉 Заключение

Instagram Stories успешно интегрированы в SunFood App и готовы к использованию! Компонент полностью совместим с концепциями из `@birdwingo/react-native-instagram-stories`, но адаптирован для веб-платформы с дополнительными возможностями для десктопа.
