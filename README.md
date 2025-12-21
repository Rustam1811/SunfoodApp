# 🏋️ RauanaGym - Personal Training PWA

> Enterprise-grade Progressive Web App for personal training with video workouts

[![Version](https://img.shields.io/badge/Version-1.0.0-blue)](package.json)
[![Performance](https://img.shields.io/badge/Performance-94%2F100-brightgreen)](PERFORMANCE_CHECKLIST.md)
[![Security](https://img.shields.io/badge/Security-Hardened-success)](docs/DEPLOYMENT.md)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

## 🚀 Quick Start

```bash
# 1. Clone and install
git clone <repo>
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your Firebase credentials

# 3. Start development
npm run dev:local  # Starts API + Web + Admin

# 4. Build for production
npm run build

# 5. Deploy
npm run deploy
```

📖 **Full deployment guide**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 🏋️ Features

### For Clients
- 📱 **Mobile-first PWA** - Install as app on any device
- 🎥 **Video workouts** - Watch exercise technique videos
- 📊 **Progress tracking** - Track your training progress
- 🏆 **Achievements** - Earn badges for consistency
- 📅 **Booking** - Schedule personal training sessions

### For Admin/Trainers
- 💪 **Exercise management** - Add muscle groups and exercises
- 🎬 **Video upload** - Attach YouTube/Vimeo videos to exercises
- 👥 **Client management** - Track client progress
- 📈 **Analytics** - View training statistics
- 🎯 **Challenges** - Create fitness challenges

## ⚡ Production-Ready Features

### Security
- ✅ **Environment validation** with Zod
- ✅ **Firestore rules** with role-based access control
- ✅ **Storage rules** with file size limits and admin-only writes
- ✅ **No secrets in Git** - all credentials in environment variables
- ✅ **Error boundaries** for graceful error handling

### Architecture
- ✅ **Multi-tenancy** - Support multiple gyms with isolated data
- ✅ **Clean code** - No console.logs, proper logger implementation
- ✅ **Modular structure** - Providers, routes, navigation separated
- ✅ **Type safety** - Full TypeScript coverage

### DevOps
- ✅ **CI/CD pipeline** with GitHub Actions
- ✅ **Automated testing** - TypeScript checks, linting
- ✅ **Preview deployments** for pull requests
- ✅ **Version 1.0.0** - Production ready

### Performance
- ✅ **FCP:** <1.5s (First Contentful Paint)
- ✅ **TTI:** <3s (Time to Interactive)
- ✅ **Bundle:** 400KB with code splitting
- ✅ **Lighthouse:** 94/100

## 🛠️ Технологии

### Frontend
- **React 18** - UI библиотека
- **TypeScript** - типизация
- **Vite** - сборщик с оптимизациями
- **Tailwind CSS** - стили
- **Framer Motion** - анимации
- **React Router v5** - роутинг

### Backend
- **Firebase** - аутентификация, Firestore, Storage
- **Node.js/Express** - API сервер
- **Firebase Functions** - serverless функции

### Оптимизации
- ✅ Code Splitting (React.lazy)
- ✅ Skeleton Loading States
- ✅ API Response Caching (5 min TTL)
- ✅ Progressive Image Loading
- ✅ Lazy Loading для компонентов
- ✅ Bundle Chunking (vendor splitting)

## 📁 Структура проекта

```
SunfoodApp/
├─ src/
│  ├─ components/         # UI компоненты
│  │  ├─ Skeleton.tsx     # 💀 Скелетоны
│  │  └─ OptimizedImage.tsx # 🖼️ Оптимизированные изображения
│  ├─ pages/              # Страницы приложения
│  ├─ hooks/              # Custom hooks
│  │  └─ useImageLoading.ts # Progressive loading
│  ├─ utils/              # Утилиты
│  │  └─ apiCache.ts      # 💾 API кэширование
│  ├─ auth/               # Аутентификация
│  ├─ contexts/           # React Context
│  └─ services/           # API сервисы
│
├─ admin/                 # Admin панель (отдельный Vite проект)
├─ functions/             # Firebase Cloud Functions
├─ api/                   # API endpoints (Express)
├─ public/                # Статические файлы
│
└─ Документация:
   ├─ PERFORMANCE_OPTIMIZATION.md   # Детальная документация
   ├─ PERFORMANCE_QUICKSTART.md     # Быстрый старт
   ├─ PERFORMANCE_COMPARISON.md     # Сравнение до/после
   └─ PERFORMANCE_CHECKLIST.md      # Чек-лист оптимизаций
```

## 🎯 Ключевые фичи

### Для пользователей
- 📱 Mobile-first дизайн
- ⚡ Мгновенная загрузка (<3s)
- 🎨 Плавные анимации
- 💾 Offline режим (PWA)
- 🔔 Push уведомления
- 🎁 Система бонусов и промокодов
- 📊 История заказов
- ⭐ Достижения

### Для разработчиков
- 🚀 Быстрый dev сервер (321ms)
- 📦 Оптимизированная сборка
- 💀 Ready-to-use скелетоны
- 🖼️ Компонент для оптимизации изображений
- 💾 Встроенное API кэширование
- 📚 Полная документация
- ✅ TypeScript везде
- 🎨 Tailwind CSS utilities

## 🔧 Использование оптимизаций

### Скелетоны
```tsx
import { HomeSkeleton } from '@/components/Skeleton';

if (loading) return <HomeSkeleton />;
```

### Кэширование API
```tsx
import { cachedFetch } from '@/utils/apiCache';

const data = await cachedFetch('/api/orders', {}, 5 * 60 * 1000);
```

### Оптимизированные изображения
```tsx
import { OptimizedImage } from '@/components/OptimizedImage';

<OptimizedImage 
  src={url} 
  alt="Coffee"
  width={800}
  quality={80}
/>
```

📖 [Полная документация](PERFORMANCE_QUICKSTART.md)

## 📊 Мониторинг производительности

### Команды
```bash
# Анализ бандла
npx vite-bundle-visualizer

# Lighthouse в CI
npx lighthouse https://your-app.com

# Dev server metrics
npm run dev
```

### Chrome DevTools
1. **Performance tab** - профилирование загрузки
2. **Network tab** - waterfall анализ
3. **Lighthouse** - комплексный анализ
4. **Coverage** - неиспользуемый код

## 🌐 Deployment

### Production
```bash
# Build
npm run build

# Deploy на Firebase Hosting
npm run deploy
```

### Переменные окружения
```env
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
```

## 📈 Roadmap

- [ ] WebP изображения для всех ассетов
- [ ] Service Worker для aggressive caching
- [ ] Prefetching следующих страниц
- [ ] HTTP/2 Server Push
- [ ] Lazy hydration для компонентов
- [ ] Bundle size < 300KB

## 🤝 Contributing

При добавлении новой страницы:
- ✅ Используйте `React.lazy()` для импорта
- ✅ Добавьте скелетон для состояния загрузки
- ✅ Оберните API запросы в `cachedFetch`
- ✅ Используйте `<OptimizedImage>` для изображений
- ✅ Проверьте через Lighthouse (Score > 90)

## 📄 Лицензия

MIT

## 👥 Команда

Разработано с ❤️ командой SunfoodApp

---

**Последнее обновление:** 23 октября 2025  
**Версия:** 1.0.0  
**Performance Score:** 94/100 ⚡
