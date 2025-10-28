import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ShoppingBagIcon } from '@heroicons/react/24/solid';
import { InstagramStoriesNew } from '../components/InstagramStoriesNew';
import { PromotionBanner } from '../components/PromotionBanner';
import { AchievementList } from '../components/AchievementList';
import { HomeSkeleton } from '../components/Skeleton';
import { useHistory } from 'react-router-dom';
import { drinkCategories } from './menu/data/drinksData';
import { useTranslation } from 'react-i18next';
import { apiUrl } from '../config/api';

interface OrderItem { name: string; quantity: number; price?: number }
interface Order { amount?: number; items?: OrderItem[] }

const getUserData = () => {
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return {
        name: user.name || 'Гость',
        avatar: user.avatar || 'https://images.unsplash.com/photo-1531123414780-f74242c2b052?auto=format&fit=crop&w=300&h=300&q=80',
        isNew: user.isNew || false,
        favoriteDrink: user.favoriteDrink || {
          name: 'Капучино',
          image: 'https://images.unsplash.com/photo-1557006034-834c6c0d49c2?auto=format&fit=crop&w=800&q=80',
        },
      };
    }
  } catch (error) {
    console.error('Error getting user info:', error);
  }
  return {
    name: 'Гость',
    avatar: 'https://images.unsplash.com/photo-1531123414780-f74242c2b052?auto=format&fit=crop&w=300&h=300&q=80',
    isNew: false,
    favoriteDrink: {
      name: 'Капучино',
      image: 'https://images.unsplash.com/photo-1557006034-834c6c0d49c2?auto=format&fit=crop&w=800&q=80',
    },
  };
};

const curatedListData = {
  title: 'Идеально к вашему утру',
  items: [
    { id: 1, name: 'Двойной эспрессо', image: 'https://images.unsplash.com/photo-1608079635298-c2693a43c64e?auto=format&fit=crop&w=800&q=80' },
    { id: 2, name: 'Свежий круассан', image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80' },
    { id: 3, name: 'Фильтр-кофе', image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80' },
  ],
};

const ProfilePill = ({ name, avatar }: { name: string; avatar: string }) => (
  <div className="flex items-center gap-2 bg-white rounded-full p-1 pr-3 shadow-sm border border-gray-200">
    <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover" loading="lazy" />
    <span className="font-semibold text-slate-800 text-sm">Привет, {name}</span>
  </div>
);

const HomePage: React.FC = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const [user] = useState(getUserData());
  const [isLoading, setIsLoading] = useState(true);

  const drinkImages: Record<string, string> = useMemo(() => ({
    Капучино: 'https://images.unsplash.com/photo-1557006034-834c6c0d49c2?auto=format&fit=crop&w=800&q=80',
    Латте: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?auto=format&fit=crop&w=800&q=80',
    Эспрессо: 'https://images.unsplash.com/photo-1608079635298-c2693a43c64e?auto=format&fit=crop&w=800&q=80',
    Американо: 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?auto=format&fit=crop&w=800&q=80',
    Мокко: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80',
  }), []);
  const getDrinkImage = useCallback((name: string) => drinkImages[name] || drinkImages['Капучино'], [drinkImages]);

  const [favoriteItem, setFavoriteItem] = useState<{ id: number | string; name: string; price?: number; image: string }>({
    name: user.favoriteDrink?.name || 'Капучино',
    price: 1500,
    image: user.favoriteDrink?.image || drinkImages['Капучино'],
    id: 0,
  });

  const getUserId = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const u = JSON.parse(userData);
        return u.phone || u.id || u.userId || '87053096206';
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
    return '87053096206';
  };

  useEffect(() => {
    (async () => {
      try {
        const userId = getUserId();
        
        // Проверяем кэш
        const cacheKey = `favorite-drink-${userId}`;
        const cached = sessionStorage.getItem(cacheKey);
        
        if (cached) {
          try {
            const cachedData = JSON.parse(cached);
            setFavoriteItem(cachedData);
            setIsLoading(false);
            return; // Используем кэш
          } catch {
            // Если кэш поврежден, продолжаем загрузку
          }
        }
        
        const response = await fetch(apiUrl('orders', { action: 'get', userId }));
        if (response.ok) {
          const orders: Order[] = await response.json();
          const itemCounts: Record<string, { count: number; price: number }> = {};
          
          // Подсчитываем количество и запоминаем цену из последнего заказа
          orders.forEach((order) => 
            order.items?.forEach((it) => {
              if (!itemCounts[it.name]) {
                itemCounts[it.name] = { count: 0, price: it.price || 0 };
              }
              itemCounts[it.name].count += it.quantity;
              itemCounts[it.name].price = it.price || itemCounts[it.name].price; // обновляем цену
            })
          );
          
          if (Object.keys(itemCounts).length > 0) {
            // Находим самый популярный напиток
            const favName = Object.keys(itemCounts).reduce((a, b) => 
              (itemCounts[a].count > itemCounts[b].count ? a : b)
            );
            
            // Ищем в меню для получения картинки
            let found = false;
            for (const category of drinkCategories) {
              const item = category.products.find((p) => 
                t(p.name) === favName || p.name === favName
              );
              if (item) {
                const newFavorite = {
                  id: item.id,
                  name: favName,
                  price: itemCounts[favName].price, // берём цену из заказа!
                  image: item.image.startsWith('/') ? `${window.location.origin}${item.image}` : item.image
                };
                setFavoriteItem(newFavorite);
                sessionStorage.setItem(cacheKey, JSON.stringify(newFavorite));
                found = true;
                break;
              }
            }
            
            // Если не нашли в меню - используем данные из заказа
            if (!found) {
              const newFavorite = {
                id: Date.now(),
                name: favName,
                price: itemCounts[favName].price,
                image: getDrinkImage(favName)
              };
              setFavoriteItem(newFavorite);
              sessionStorage.setItem(cacheKey, JSON.stringify(newFavorite));
            }
          }
        }
      } catch (err) {
        console.error('Error loading favorite drink:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [t, getDrinkImage]);

  const handleQuickOrder = () => {
    history.push('/order', { quickOrder: true, selectedItem: { id: favoriteItem.id, name: favoriteItem.name, image: favoriteItem.image, price: favoriteItem.price || 1500 } });
  };

  if (isLoading) {
    return <HomeSkeleton />;
  }

  return (
<<<<<<< HEAD
    <div className="min-h-screen font-sans bg-inherit">
      <header className="sticky top-0 z-30 px-4 py-3 ">
=======
    <div className="min-h-screen font-sans bg-slate-100" style={{ transform: 'translateZ(0)' }}>
      <header className="sticky top-0 z-30 px-4 py-3 bg-white border-b border-gray-200">
>>>>>>> 248862203ee85c67a5644dffe59762c6166a1e01
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Coffee Addict</h1>
          <ProfilePill name={user.name} avatar={user.avatar} />
        </div>
      </header>

      <main className="space-y-8 pb-28">
        <section className="px-4">
          <InstagramStoriesNew />
        </section>

        {/* Быстрый заказ — ЧИСТО БЕЛАЯ карточка */}
        <section className="px-4">
          <div className="rounded-3xl bg-white shadow-lg overflow-hidden" style={{ contain: 'layout style paint' }}>
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-md">
                  {user.avatar ? (
                    <img src={user.avatar} className="w-full h-full object-cover" alt="" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xl font-bold">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-slate-900 truncate">С возвращением, {user.name}!</h2>
                  <p className="text-sm text-slate-600">Ваш любимый {favoriteItem.name} ждёт.</p>
                </div>
              </div>

              <button
                onClick={handleQuickOrder}
                className="mt-4 w-full h-12 rounded-full bg-slate-900 text-white font-semibold flex items-center justify-center gap-2 shadow-lg active:scale-95 hover:bg-black transition-all duration-150"
              >
                <ShoppingBagIcon className="w-5 h-5" />
                Заказать в 1 клик
              </button>
            </div>
          </div>
        </section>

        {/* Акции — full-width горизонтальный скролл */}
        <section className="-mx-0">
          <PromotionBanner showAll={true} />
        </section>

        {/* Достижения */}
        <section className="px-4">
          <AchievementList />
        </section>

        {/* Подборка */}
        <section className="px-4">
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold tracking-tight">{curatedListData.title}</h2>
              <button className="text-sm text-slate-500">Смотреть все</button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {curatedListData.items.map((it) => (
                <div key={it.id} className="rounded-xl overflow-hidden bg-white shadow-card" style={{ contain: 'layout style paint' }}>
                  <img src={it.image} alt="" className="w-full h-24 object-cover" loading="lazy" />
                  <div className="p-2 text-[12px] font-medium line-clamp-2">{it.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
