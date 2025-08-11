import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface PremiumDrinkBadge { type:string; label:string; color?:string; }
export interface PremiumDrinkItem {
  id: string | number;
  name: string;
  price: number;
  image: string;
  badges?: PremiumDrinkBadge[];
  energy?: number; protein?: number; fat?: number; carbs?: number;
  categoryId?: number; // added for category filtering
}

interface Props { item: PremiumDrinkItem; onOpen: (id: string|number)=>void; }

export const DrinkCardPremium: React.FC<Props> = ({ item, onOpen }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.button
      layoutId={`drink-card-${item.id}`}
      onClick={() => onOpen(item.id)}
      data-fly-id={item.id}
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 600, damping: 40 }}
      className="
        group relative flex flex-col
        w-full h-[320px] p-0
        bg-white
        rounded-[28px]
        shadow-[0_1px_3px_rgba(0,0,0,0.05)]
        hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]
        border-0
        transition-all duration-300 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2
        overflow-hidden
      "
    >
      {/* Simple badge */}
      {item.badges && item.badges.length > 0 && (
        <div className="absolute top-4 left-4 z-10">
          <div className="
            px-2 py-1
            bg-black
            text-white text-[10px] font-medium uppercase tracking-wider
            rounded-md
          ">
            {item.badges[0].label}
          </div>
        </div>
      )}

      {/* Image section - clean and spacious */}
      <div className="relative flex-1 flex items-center justify-center p-6">
        {/* Loading skeleton */}
        {!loaded && (
          <div className="w-[70%] h-[70%] bg-gray-100 rounded-xl animate-pulse" />
        )}
        
        {/* Product image - minimal drop shadow */}
        <motion.img
          layoutId={`drink-img-${item.id}`}
          src={item.image}
          alt={item.name}
          onLoad={() => setLoaded(true)}
          className={`
            w-[70%] h-auto object-contain
            drop-shadow-sm
            transition-all duration-300 ease-out
            ${loaded ? 'opacity-100' : 'opacity-0'}
            group-hover:scale-105
          `}
        />
      </div>

      {/* Info section - minimal and clean */}
      <div className="flex flex-col p-6 pt-0">
        <motion.h3
          layoutId={`drink-title-${item.id}`}
          className="
            text-[16px] font-medium leading-tight
            text-black
            mb-3
            line-clamp-2
          "
        >
          {item.name}
        </motion.h3>
        
        <div className="flex items-center justify-between">
          <span className="text-[18px] font-semibold text-black">
            {item.price} ₸
          </span>
          
          {/* Minimal add button */}
          <div className="
            w-8 h-8 
            bg-black
            text-white
            rounded-full 
            flex items-center justify-center
            transition-all duration-200
            group-hover:scale-110
          ">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
        </div>
      </div>
    </motion.button>
  );
};
