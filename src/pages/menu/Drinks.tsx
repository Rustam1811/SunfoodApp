import React, { useMemo } from 'react';
import { drinkCategories } from '../menu/data/drinksData';
import { PremiumMenu } from '../../features/menu/premium/PremiumMenu';

export default function Drinks() {
  const items = useMemo(
    () =>
      drinkCategories.flatMap(cat =>
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
          categoryId: cat.id,
        })),
      ),
    [],
  );
  const categories = useMemo(
    () => drinkCategories.map(c => ({ key: String(c.id), label: c.title })),
    [],
  );
  return <PremiumMenu items={items} categories={categories} />;
}