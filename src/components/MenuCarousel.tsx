import React, { useState } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { useSwipe } from '../hooks/useSwipe';

interface MenuItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

const menuItems: MenuItem[] = [
  { id: 1, title: 'Эспрессо', description: 'Классический крепкий кофе', imageUrl: '/images/espresso-3d.png' },
  { id: 2, title: 'Капучино', description: 'Кофе с молочной пенкой', imageUrl: '/images/cappuccino-3d.png' },
  { id: 3, title: 'Латте', description: 'Мягкий и нежный', imageUrl: '/images/latte-3d.png' },
];

const MenuCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [splideRef, setSplideRef] = useState<any>(null);

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      if (splideRef && currentSlide < menuItems.length - 1) {
        splideRef.go(currentSlide + 1);
      }
    },
    onSwipeRight: () => {
      if (splideRef && currentSlide > 0) {
        splideRef.go(currentSlide - 1);
      }
    },
  }, { threshold: 75 });

  return (
    <div className="p-4" {...swipeHandlers}>
      <h2 className="text-xl font-bold mb-4">Меню кофейни</h2>
      <Splide 
        ref={setSplideRef}
        options={{ 
          perPage: 1, 
          rewind: true,
          pagination: true,
          arrows: false 
        }}
        onMove={(_splide, newIndex) => setCurrentSlide(newIndex)}
      >
        {menuItems.map(item => (
          <SplideSlide key={item.id}>
            <div className="flex flex-col items-center">
              <img src={item.imageUrl} alt={item.title} className="w-64 h-64 object-cover" />
              <h3 className="text-lg font-semibold mt-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          </SplideSlide>
        ))}
      </Splide>
    </div>
  );
};

export default MenuCarousel;
