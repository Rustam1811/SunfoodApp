import React from 'react';
import { DrinkItem } from './types';
import { motion } from 'framer-motion';

interface Props {
  item: DrinkItem;
  onSelect: (id: string | number) => void;
}

export const DrinkCard: React.FC<Props> = ({ item, onSelect }) => {
  return (
    <motion.button
      layoutId={`drink-card-${item.id}`}
      whileTap={{ scale: 0.96 }}
      onClick={() => onSelect(item.id)}
      className="
        group relative flex flex-col items-center justify-end 
        rounded-2xl p-4 aspect-[3/4] bg-white
        shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.08)]
        hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_8px_20px_rgba(0,0,0,0.12)]
        transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-amber-400/50
        overflow-hidden
      "
    >
      {/* градиент при ховере */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.015)_55%,rgba(0,0,0,0.06)_100%)] opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* изображение */}
      <motion.img
        layoutId={`drink-img-${item.id}`}
        src={item.image}
        alt={item.name}
        className="
          absolute top-4 left-1/2 -translate-x-1/2 w-[70%] h-auto object-contain
          transition-transform duration-500 
          group-active:scale-95 group-hover:scale-[1.04]
          drop-shadow-[0_6px_12px_rgba(0,0,0,0.12)]
        "
        loading="lazy"
      />

      {/* отступ под картинку */}
      <div className="mt-auto w-full pt-[70%]" />

      {/* текст */}
      <h3 className="mt-2 text-[13px] font-medium text-neutral-900 text-center leading-tight line-clamp-2 min-h-[34px] tracking-tight">
        {item.name}
      </h3>
      <div className="text-[13px] font-semibold text-neutral-900 mt-1 tracking-tight">
        {item.price} ₸
      </div>
    </motion.button>
  );
};
