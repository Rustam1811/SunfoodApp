import React from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';

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
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Меню кофейни</h2>
      <Splide options={{ perPage: 1, rewind: true }}>
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
