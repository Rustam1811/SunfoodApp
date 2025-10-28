import React, { useState } from 'react';
import { useInView } from '../../../hooks/useInView';

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

interface Props { item: PremiumDrinkItem; onOpen: (id: string|number)=>void; index?: number; prefersReduced?: boolean; }

export const DrinkCardPremiumImpl: React.FC<Props> = ({ item, onOpen }) => {
  const [loaded, setLoaded] = useState(false);
  const { ref, isInView } = useInView();

  return (
<<<<<<< HEAD
    <button
      onClick={() => onOpen(item.id)}
      data-fly-id={item.id}
      className="
        group relative flex flex-col
        w-full h-[240px] p-0
        bg-white
        rounded-[20px]
        shadow-[0_1px_3px_rgba(0,0,0,0.05)]
        hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]
        active:scale-[0.98]
        border-0
        transition-all duration-150 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2
        overflow-hidden
        will-change-transform
      "
      style={{ contain: 'layout style paint' }}
    >
=======
    <div ref={ref} style={{ minHeight: '280px' }}>
      {!isInView ? (
        <div className="w-full h-[280px] bg-gray-100 rounded-3xl" />
      ) : (
        <button
          onClick={() => onOpen(item.id)}
          data-fly-id={item.id}
          className="
            group relative flex flex-col
            w-full h-[280px] p-0
            bg-white
            rounded-3xl
            shadow-sm
            hover:shadow-lg
            active:scale-[0.98]
            border-0
            transition-all duration-100 ease-out
            focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2
            overflow-hidden
          "
          style={{ contain: 'layout style paint', transform: 'translateZ(0)' }}
        >
>>>>>>> 248862203ee85c67a5644dffe59762c6166a1e01
      {/* Simple badge */}
      {item.badges && item.badges.length > 0 && (
        <div className="absolute top-3 left-3 z-10">
          <div className="
            px-2 py-1
            bg-black
            text-white text-[9px] font-medium uppercase tracking-wider
            rounded-md
          ">
            {item.badges[0].label}
          </div>
        </div>
      )}

<<<<<<< HEAD
      {/* Image section - clean and spacious */}
      <div className="relative flex-1 flex items-center justify-center p-3">
        <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
          {/* Product image - NO layout animations, fixed aspect ratio */}
=======
      {/* Image section - компактный */}
      <div className="relative flex-1 flex items-center justify-center p-4">
        <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-50">
          {/* Product image */}
>>>>>>> 248862203ee85c67a5644dffe59762c6166a1e01
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            width={280}
            height={280}
            onLoad={() => setLoaded(true)}
            style={{ aspectRatio: '1/1', transform: 'translateZ(0)' }}
            className={`
              w-full h-full object-cover
              transition-opacity duration-150
              ${loaded ? 'opacity-100' : 'opacity-0'}
            `}
          />
        </div>
      </div>

<<<<<<< HEAD
      {/* Info section - minimal and clean */}
      <div className="flex flex-col p-3 pt-0">
        <h3 className="
            text-[13px] font-medium leading-tight
            text-black
            mb-1.5
=======
      {/* Info section - компактный */}
      <div className="flex flex-col p-4 pt-2">
        <h3 className="
            text-sm font-semibold leading-tight
            text-black
            mb-2
>>>>>>> 248862203ee85c67a5644dffe59762c6166a1e01
            line-clamp-2
          "
        >
          {item.name}
        </h3>
        
        <div className="flex items-center justify-between">
<<<<<<< HEAD
          <span className="text-[15px] font-semibold text-black">
=======
          <span className="text-base font-bold text-black">
>>>>>>> 248862203ee85c67a5644dffe59762c6166a1e01
            {item.price} ₸
          </span>
          
          {/* Minimal add button */}
          <div className="
            w-7 h-7 
            bg-black
            text-white
            rounded-full 
            flex items-center justify-center
            transition-all duration-200
            group-hover:scale-110
          ">
<<<<<<< HEAD
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
=======
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
>>>>>>> 248862203ee85c67a5644dffe59762c6166a1e01
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
        </div>
      </div>
        </button>
      )}
    </div>
  );
};

export const DrinkCardPremium = React.memo(DrinkCardPremiumImpl);
