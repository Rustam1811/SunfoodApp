import React, { useMemo, useState, memo } from 'react';
import { drinkCategories } from './data/drinksData';
import { foodCategories } from './data/foodData';
import { PremiumMenu } from '../../features/menu/premium/PremiumMenu';
import { useTranslation } from 'react-i18next';

const humanize = (key: string) => key.split('.').pop()?.replace(/_/g,' ') || key;

const Menu: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'drinks' | 'food'>('drinks');
  
  const drinksItems = useMemo(() => 
    drinkCategories.flatMap(cat =>
      cat.products.map(p => {
        const rawName = t(p.name);
        const name = rawName === p.name ? humanize(p.name) : rawName;
        return { 
          id: p.id, 
          name, 
          price: p.price, 
          image: p.image, 
          energy: p.energy, 
          protein: p.protein, 
          fat: p.fat, 
          carbs: p.carbs, 
          badges: p.badges?.map(b => ({ type: b, label: b })) || [], 
          categoryId: cat.id 
        };
      })
    ),
    [t]
  );
  
  const drinksCategories = useMemo(() => 
    drinkCategories.map(c => { 
      const raw = t(c.title); 
      const label = raw === c.title ? humanize(c.title) : raw; 
      return { key: String(c.id), label }; 
    }),
    [t]
  );

  const foodItems = useMemo(() => 
    foodCategories.flatMap(cat =>
      cat.products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
        energy: p.energy,
        protein: p.protein,
        fat: p.fat,
        carbs: p.carbs,
        badges: p.badges?.map(b => ({ type: b, label: b })) || [],
        categoryId: cat.id
      }))
    ),
    []
  );

  const foodCategoriesFormatted = useMemo(() =>
    foodCategories.map(c => ({
      key: String(c.id),
      label: c.title
    })),
    []
  );
  
  return (
    <div className="min-h-screen bg-[var(--color-bg-base)]" style={{ transform: 'translateZ(0)' }}>
      {/* Переключатель Напитки/Еда */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex gap-2 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('drinks')}
            className={`flex-1 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-150 active:scale-95 ${
              activeTab === 'drinks'
                ? 'bg-slate-900 text-white shadow-lg'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ☕ Напитки
          </button>
          <button
            onClick={() => setActiveTab('food')}
            className={`flex-1 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-150 active:scale-95 ${
              activeTab === 'food'
                ? 'bg-slate-900 text-white shadow-lg'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🍔 Еда
          </button>
        </div>
      </div>

      {/* Контент */}
      {activeTab === 'drinks' ? (
        <PremiumMenu items={drinksItems} categories={drinksCategories} type="drinks" />
      ) : (
        <PremiumMenu items={foodItems} categories={foodCategoriesFormatted} type="food" />
      )}
    </div>
  );
};

export default memo(Menu);
